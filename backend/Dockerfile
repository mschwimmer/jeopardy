ARG TARGETPLATFORM=linux/amd64

# Stage 1: Build the application
FROM --platform=$TARGETPLATFORM rust AS builder
WORKDIR /app

# Copy the workspace manifest and lockfile
COPY Cargo.toml Cargo.lock ./
# Also copy the backend manifest file
COPY backend/Cargo.toml backend/

# Create a dummy main file so that dependencies can be compiled
RUN mkdir -p backend/src && echo "fn main() {}" > backend/src/main.rs
RUN cargo build --release --bin backend
RUN rm -f backend/src/main.rs

# Copy the full source code and rebuild the binary
COPY . .
RUN cargo build --release --bin backend

# Stage 2: Create a minimal runtime container
FROM --platform=$TARGETPLATFORM debian:stable-slim
# Install libpq, which provides libpq.so.5
RUN apt-get update && apt-get install -y libpq5 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/backend .

# Expose the port your app listens on (adjust if necessary)
EXPOSE 8080

# Run the binary
CMD ["./backend"]