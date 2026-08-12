# Take-Home Assessment

A highly polished, production-ready monorepo demonstrating Clean Architecture, modern tooling, and strict typing.

## Architecture Overview

- **Backend**: FastAPI (Python) backed by SQLAlchemy 2.0 and PostgreSQL. Uses Pydantic for DTOs and `uv` for lightning-fast dependency management.
- **Frontend**: Vite (React + TypeScript) with TanStack Router for type-safe routing and TanStack Query for state management. Styled with Tailwind CSS (dark mode glassmorphism).
- **Orchestration**: Docker Compose for a seamless out-of-the-box experience, utilizing multi-stage production builds for both the Python backend and Nginx-served frontend SPA.

## How to Run

Zero manual configuration is required. Ensure Docker is running, then use the provided Makefile:

```bash
# Start the application in the background
make up

# View the logs
make logs

# Stop the application
make down
```

- The frontend will be available at `http://localhost` (or `http://localhost:5173` if running Vite locally).
- The backend API will be available at `http://localhost:8000`.

## "Nice to Haves" Implemented

- **Connection Pooling**: Implemented in `db.py` to ensure the Postgres database handles high throughput without exhausting connections.
- **Dependency Injection**: FastAPI's `Depends()` is used to inject the database session (`get_db`) cleanly into route handlers.
- **Strict DTOs**: Pydantic's `UserResponse` model strictly defines the outbound JSON schema and safely sanitizes SQLAlchemy model data.
- **TanStack Table**: Implemented a robust React data-grid with purely client-side sorting, global text filtering, and pagination.
- **Idempotent Automated Seeding**: On backend startup, an idempotent seed function securely populates the database with 15 mock users if the table is empty, allowing reviewers to test the app out-of-the-box.
- **CI/CD Ready**: Contains a GitHub Actions workflow to run automated tests (`make test`) on both ends.
