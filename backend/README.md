# Jeopardy Backend Notes

These are notes which explain the tools we chose and why. We're writing our backend with Rust, because we like crabs.

## Tools

### diesel

Disel is an ORM and Querybuilder for Rust. It allows us to connect to and interact with our PostgresDB. We will be using diesel migrations to format our database. Diesel works with Axum, and GraphQL.

### diesel migrations

Diesel migrations are used to version control your database schema changes, such as creating tables, adding columns, or modifying existing structures.

#### Example: Adding a column to a table

Here's how to add a new `email` column to the `users` table using Diesel migrations.

1. **Generate a new migration**:

   In backend/, run

   ```bash
   diesel migration generate add_email_to_users
   ```

   to create a new migration folder in /backend/db/migrations/

2. **Edit the migration files**

   up.sql

   ```sql
   ALTER TABLE users ADD COLUMN email TEXT;
   ```

   down.sql

   ```sql
   ALTER TABLE users DROP COLUMN email;
   ```

3. **Run migration**

   ```bash
   diesel migration run
   ```

4. **Verify migration**

   Connect to the database using psql and check if the new column was added:

   ```bash
   psql -U <your_username> -d <your_database>
   \d users
   ```

### axum

We use axum as a web app framework for Rust. (think Flask for Python). We use Axum to create a backend server that handles route requests. We're going to be making our api with graphQL.

### tower-http

We use tower-http as a middleware between our frontend and backend. It allows our Axum server to accept http requests from a different origin (our frontend). Without middleware, our frontend and backend can't talk to each other.

## Run

First, make sure Dockerfile is correct.

Then, use the Dockerfile to create an image locally.

```sh
docker build -t rust-backend:latest .
```

Then, tag the new image and increment the version number

```sh
docker tag rust-backend:latest us-east1-docker.pkg.dev/jeopardy-b4166/docker-rust-repo/backend-image:v2
```

Then, push the tagged image

```sh
docker push us-east1-docker.pkg.dev/jeopardy-b4166/docker-rust-repo/backend-image:v2
```

Then, once pushed to artifact registry, deploy

````sh
gcloud run deploy backend-service \
  --image us-east1-docker.pkg.dev/jeopardy-b4166/docker-rust-repo/backend-image:v1 \
  --set-env-vars KEY=VALUE,OTHER_KEY=OTHER_VALUE \
  --platform managed \
  --region us-east1
````
