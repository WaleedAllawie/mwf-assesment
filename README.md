# MAKE WORK FLOW - Technical Assessment

A containerized, production-ready full-stack monorepo demonstrating clean architecture, modern toolchains, and strict typing across a FastAPI backend and a React/TypeScript frontend.

---

## 🏗️ Architecture & Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── db.py          # Database connection, pooling, and engine setup
│   │   ├── main.py        # FastAPI routes, CORS, middleware, and exception handlers
│   │   └── model.py       # SQLAlchemy 2.0 User model with database-level audit fields
│   ├── tests/             # Pytest backend endpoint test suite
│   ├── Dockerfile         # Multi-stage build running non-root with UV package manager
│   └── pyproject.toml     # Python dependencies managed via UV
├── frontend/
│   ├── src/
│   │   ├── api/           # Base API client configuration (env variable driven)
│   │   ├── components/    # Reusable components & TanStack Table implementation
│   │   ├── routes/        # TanStack Router root and index routes
│   │   └── types/         # TypeScript interfaces matching backend Pydantic DTOs
│   ├── Dockerfile         # Multi-stage build serving production SPA via Nginx
│   └── vite.config.ts     # Vite configuration with absolute path aliases
├── .github/
│   └── workflows/
│       └── main.yml       # CI/CD workflow for automated testing and linting
├── docker-compose.yml     # Multi-service orchestration with PostgreSQL health checks
├── Makefile               # Development CLI shortcuts
└── README.md

```

### Tech Stack

* **Backend:** FastAPI (Python), SQLAlchemy 2.0, PostgreSQL, Pydantic v2, `uv` (package manager).
* **Frontend:** React, TypeScript, Vite, TanStack Query v5, TanStack Router, TanStack Table v8, Tailwind CSS.
* **Orchestration & DevOps:** Docker Compose, Multi-stage Dockerfiles, Makefile, GitHub Actions CI/CD.

---

## ⚙️ Prerequisites

To run this project out-of-the-box, you only need to have the following installed on your host machine:

* [Docker](https://www.docker.com/get-started/)
* [Docker Compose](https://docs.docker.com/compose/)
* `make` (standard on macOS/Linux; available via WSL/Git Bash on Windows)

---

## 🚀 Quick Start (How to Run)

The repository is fully self-contained. Database migrations, container health dependencies, and initial mock data seeding execute automatically upon startup.

```bash
# 1. Clone the repository
git clone https://github.com/WaleedAllawie/mwf-assesment.git
cd mwf-assesment

# 2. Build and start all services in the background
make up

# 3. View live, aggregated container logs
make logs

# 4. Tear down containers and networks
make down

```

### Accessing the Applications

* **Frontend UI:** [http://localhost](http://localhost) *(or http://localhost:5173 when running Vite locally)*
* **Backend API:** [http://localhost:8000](http://localhost:8000)
* **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Tests

Automated testing is configured for both backend and frontend environments:

```bash
# Run backend and frontend test suites
make test

```

---

## ✨ Implemented Features & "Nice-to-Haves"

### Backend Architectural Highlights

1. **`uv` Package Manager:** Replaced traditional `pip`/`poetry` with `uv` for lightning-fast dependency resolution and virtualenv setup within the Docker build pipeline.
2. **Database Connection Pooling:** Configured explicit `pool_size` and `max_overflow` parameters in `db.py` to allow the application to handle concurrent requests without exhausting PostgreSQL connection limits.
3. **Dependency Injection (DI):** Uses FastAPI’s `Depends(get_db)` pattern to cleanly inject scoped database sessions into route handlers, facilitating isolated unit testing and mock injection.
4. **Strict Data Transfer Objects (DTOs):** Utilizes Pydantic models (`UserResponse`) to enforce strict outbound JSON schemas and sanitize raw SQLAlchemy ORM objects before leaving the API boundary.
5. **Automated Idempotent Seeding:** On backend boot, an idempotent seed function checks if the `users` table is empty. If empty, it automatically populates the database with 15 initial user records to ensure immediate functionality upon testing.
6. **Centralized Error Handling & Structured Logging:** Implemented structured timestamp logging alongside global exception handlers to intercept database and HTTP errors, returning standard JSON payload responses.

### Frontend Architectural Highlights

1. **TanStack Query (React Query v5):** Handles asynchronous state, caching, loading indicators, and error boundaries for API requests.
2. **TanStack Router:** Provides strict, type-safe client-side routing.
3. **TanStack Table (Data Grid Loophole):** Honors the single-button requirement by loading data on click, then transitioning into an interactive data table with client-side column sorting, global text search, and pagination.
4. **Strict TypeScript Schemas:** Frontend interfaces explicitly mirror backend Pydantic models to guarantee end-to-end type safety.
5. **Environment Configuration:** API client relies strictly on `import.meta.env.VITE_API_URL`, ensuring zero hardcoded URLs across environments.

### Infrastructure & DevOps Highlights

1. **PostgreSQL Health Checks:** The `docker-compose.yml` uses a native `pg_isready` health check with `depends_on: condition: service_healthy` to ensure the FastAPI backend strictly waits for the database to accept TCP connections before initiating migrations/seeding.
2. **Multi-Stage Security-Hardened Dockerfiles:** Minimizes final container image sizes and runs application processes under dedicated non-root user accounts.
3. **CI/CD Workflow:** Included `.github/workflows/main.yml` automatically executes code style checks and test suites on every pull request or push.
