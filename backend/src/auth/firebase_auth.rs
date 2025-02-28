use async_graphql::Context;
use axum::{
    extract::{FromRequest, FromRequestParts, Request},
    http::StatusCode,
};
use jsonwebtoken::jwk::JwkSet;
use jsonwebtoken::{decode, decode_header, DecodingKey, Validation};
use reqwest;
use serde::Deserialize;
use std::sync::LazyLock;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// We lock the cached JsonWebKey (JWK)
/// LazyLock: only initialized if called, otherwise doesn't take memory
/// RwLock: Asynchronous lock. 1 writer, multiple readers
/// CachedJwKSet: Our struct that stores jwks and an expiration instant
static FIREBASE_JWKS_CACHE: LazyLock<RwLock<CachedJwkSet>> = LazyLock::new(|| {
    RwLock::new(CachedJwkSet {
        jwks: JwkSet { keys: Vec::new() },
        expires_at: Instant::now(), // initialized as expired
    })
});

struct CachedJwkSet {
    jwks: JwkSet,
    expires_at: Instant,
}

/// Fetch the Firebase JWK set from Google's endpoint.
async fn fetch_firebase_jwks() -> Result<JwkSet, Box<dyn std::error::Error>> {
    let url =
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
    let res = reqwest::get(url).await?;
    let jwks: JwkSet = res.json().await?;
    Ok(jwks)
}

/// Retrieve the DecodingKey corresponding to the provided `kid` from the cached JWK set.
/// If the cache is expired or the key is missing, fetch a fresh set.
async fn get_decoding_key_from_jwks(kid: &str) -> Result<DecodingKey, Box<dyn std::error::Error>> {
    {
        let cache = FIREBASE_JWKS_CACHE.read().await;
        // If our cached keys haven't expired yet:
        if Instant::now() < cache.expires_at {
            if let Some(jwk) = cache
                .jwks
                .keys
                .iter()
                .find(|j| j.common.key_id.as_deref() == Some(kid))
            {
                return DecodingKey::from_jwk(jwk).map_err(|e| e.into());
            }
        }
    }
    // Cache expired or key not found; fetch fresh JWK set.
    let jwks = fetch_firebase_jwks().await?;
    let expires_at = Instant::now() + Duration::from_secs(3600);
    {
        let mut cache = FIREBASE_JWKS_CACHE.write().await;
        cache.jwks = jwks;
        cache.expires_at = expires_at;
        if let Some(jwk) = cache
            .jwks
            .keys
            .iter()
            .find(|j| j.common.key_id.as_deref() == Some(kid))
        {
            return DecodingKey::from_jwk(jwk).map_err(|e| e.into());
        }
    }
    Err("Firebase public key not found for the provided kid".into())
}

#[derive(Debug, Deserialize, Clone)]
pub struct FirebaseClaims {
    pub uid: String,
    pub iss: String,
    pub aud: String,
    pub exp: usize,
    // Optional: Add more claims that might be useful
    // #[serde(default)]
    // pub email: Option<String>,
    // #[serde(default)]
    // pub email_verified: Option<bool>,
    // #[serde(default)]
    // pub name: Option<String>,
    // #[serde(default)]
    // pub picture: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    claims: FirebaseClaims,
}

impl AuthenticatedUser {
    /// firebase uid
    pub fn uid(&self) -> &str {
        &self.claims.uid
    }

    // pub fn email(&self) -> Option<&str> {
    //     self.claims.email.as_deref()
    // }

    // pub fn is_email_verified(&self) -> bool {
    //     self.claims.email_verified.unwrap_or(false)
    // }

    // pub fn name(&self) -> Option<&str> {
    //     self.claims.name.as_deref()
    // }

    // Get all claims for complete access
    pub fn claims(&self) -> &FirebaseClaims {
        &self.claims
    }

    // TODO add function to return backend user ID
}

/// Returns authenticated user if exists, None otherwise
pub fn get_user_from_context<'a>(ctx: &'a Context<'_>) -> Option<&'a AuthenticatedUser> {
    ctx.data_opt::<AuthenticatedUser>()
}

/// Returns authenticated user, or error if not authenticated
pub fn require_auth<'a>(
    ctx: &'a Context<'_>,
) -> Result<&'a AuthenticatedUser, async_graphql::Error> {
    ctx.data::<AuthenticatedUser>()
        .map_err(|_| async_graphql::Error::new("Authentication required"))
}

impl<S> FromRequest<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request(req: Request, _state: &S) -> Result<Self, Self::Rejection> {
        // Get headers
        let headers = req.headers();

        // 1. Extract the token from the Authorization header
        let auth_header = headers
            .get("Authorization")
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header"))?;

        let auth_str = auth_header.to_str().map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                "Invalid Authorization header format",
            )
        })?;

        let token = auth_str
            .strip_prefix("Bearer ")
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Bearer prefix"))?;

        // 2. Decode the token header to extract the kid
        let header = decode_header(token)
            .map_err(|_| (StatusCode::UNAUTHORIZED, "Failed to decode token header"))?;

        let kid = header
            .kid
            .ok_or((StatusCode::UNAUTHORIZED, "Missing kid in token header"))?;

        // 3. Get decoding key
        let decoding_key = match get_decoding_key_from_jwks(&kid).await {
            Ok(key) => key,
            Err(_) => return Err((StatusCode::UNAUTHORIZED, "Failed to fetch decoding key")),
        };

        // 4. Set up validation
        let mut validation = Validation::default();
        validation.set_issuer(&["https://securetoken.google.com/jeopardy-b4166"]);
        validation.set_audience(&["jeopardy-b4166"]);

        // 5. Decode and verify
        let token_data = match decode::<FirebaseClaims>(token, &decoding_key, &validation) {
            Ok(data) => data,
            Err(_) => return Err((StatusCode::UNAUTHORIZED, "Token verification failed")),
        };

        // 6. Check token expiration
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Clock error"))?
            .as_secs() as usize;

        if token_data.claims.exp < current_time {
            return Err((StatusCode::UNAUTHORIZED, "Token expired"));
        }

        Ok(AuthenticatedUser {
            claims: token_data.claims,
        })
    }
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(
        parts: &mut http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        // Get headers
        let headers: &http::HeaderMap = &parts.headers;

        // 1. Extract the token from the Authorization header
        let auth_header = headers
            .get("Authorization")
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header"))?;

        let auth_str = auth_header.to_str().map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                "Invalid Authorization header format",
            )
        })?;

        let token = auth_str
            .strip_prefix("Bearer ")
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Bearer prefix"))?;

        // 2. Decode the token header to extract the kid
        let header = decode_header(token)
            .map_err(|_| (StatusCode::UNAUTHORIZED, "Failed to decode token header"))?;

        let kid = header
            .kid
            .ok_or((StatusCode::UNAUTHORIZED, "Missing kid in token header"))?;

        // 3. Get decoding key
        let decoding_key = match get_decoding_key_from_jwks(&kid).await {
            Ok(key) => key,
            Err(_) => return Err((StatusCode::UNAUTHORIZED, "Failed to fetch decoding key")),
        };

        // 4. Set up validation
        let mut validation = Validation::default();
        validation.set_issuer(&["https://securetoken.google.com/jeopardy-b4166"]);
        validation.set_audience(&["jeopardy-b4166"]);

        // 5. Decode and verify
        let token_data = match decode::<FirebaseClaims>(token, &decoding_key, &validation) {
            Ok(data) => data,
            Err(_) => return Err((StatusCode::UNAUTHORIZED, "Token verification failed")),
        };

        // 6. Check token expiration
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Clock error"))?
            .as_secs() as usize;

        if token_data.claims.exp < current_time {
            return Err((StatusCode::UNAUTHORIZED, "Token expired"));
        }

        Ok(AuthenticatedUser {
            claims: token_data.claims,
        })
    }
}
