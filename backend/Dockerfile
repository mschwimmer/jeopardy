ARG TARGETPLATFORM=linux/amd64

# Stage 0: Prepare cargo-chef
FROM --platform=$TARGETPLATFORM rust:slim AS chef
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && cargo install cargo-chef

# Stage 1: Create a recipe file
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 2: Build dependencies
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the key step that will be cached
RUN cargo chef cook --release --recipe-path recipe.json

# Stage 3: Build the application
COPY . .
RUN cargo build --release --bin backend

# Stage 4: Create a minimal runtime container
FROM --platform=$TARGETPLATFORM debian:stable-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/backend .
EXPOSE 8080
CMD ["./backend"]