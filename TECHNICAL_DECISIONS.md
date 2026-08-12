# Technical Decisions & Architecture

This document outlines the core architectural decisions, technology choices, and trade-offs made during the development of this monorepo assessment.

## 1. Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL

### Why FastAPI?
- **Performance & Async Support:** Built on Starlette, it natively supports `asyncio`, making it highly performant for I/O bound operations (like database queries).
- **Type Safety & Validation:** Deep integration with Pydantic means that request/response payloads are strictly validated against Python type hints, eliminating an entire class of runtime errors.
- **Developer Experience:** Auto-generated OpenAPI (Swagger) documentation drastically speeds up frontend integration and testing.

### Why SQLAlchemy 2.0 & PostgreSQL?
- **SQLAlchemy 2.0:** Moving to the 2.0 style ensures forward-compatibility and enforces strict typing. The `Session` dependency injection pattern prevents connection leaks and ensures atomic transactions.
- **PostgreSQL:** Chosen over SQLite for production parity. It handles concurrent connections gracefully, which is crucial for modern web applications. We also implemented **Connection Pooling** in `db.py` to ensure the database can withstand high throughput without exhausting connections.

### Why `uv` for Dependency Management?
- **Speed:** `uv` is an extremely fast Python package installer and resolver written in Rust. It significantly reduces Docker build times and local setup times compared to traditional `pip` or `poetry`.
- **Reproducibility:** `uv.lock` ensures deterministic builds across local environments, CI/CD, and production Docker containers.

---

## 2. Frontend: React + Vite + TanStack

### Why Vite?
- **Build Speed:** Native ES modules and esbuild make local server startup nearly instantaneous and HMR (Hot Module Replacement) incredibly fast compared to Webpack or Create React App.

### Why the TanStack Ecosystem?
- **TanStack Query (React Query):** Eliminates the need for complex global state management (like Redux) by treating server state as a first-class citizen. It provides out-of-the-box caching, background refetching, and loading/error states.
- **TanStack Table:** A headless UI library that gives us complete control over the markup and styling while handling complex logic like sorting, global text filtering, and pagination without heavy dependencies.
- **TanStack Router:** Provides strict, type-safe routing. It ensures that any changes to route parameters or URLs are caught at compile-time rather than runtime.

### Why Tailwind CSS?
- **Utility-First:** Allows for rapid UI prototyping directly in the markup without context-switching to CSS files. 
- **Performance:** The JIT (Just-In-Time) compiler ensures that only the CSS classes actually used in the project are bundled, resulting in a microscopic CSS footprint in production.

---

## 3. DevOps & Orchestration

### Why Docker Compose & Multi-Stage Builds?
- **Zero-Configuration Onboarding:** Reviewers and future developers can spin up the entire stack (Database, API, Frontend) with a single `docker-compose up` command. No local dependencies required other than Docker.
- **Multi-Stage Builds:** 
  - **Backend:** Dependencies are built in a `builder` stage and only the compiled virtual environment is copied to the final `python:3.12-slim` image, minimizing attack surface and image size.
  - **Frontend:** The React app is compiled to static HTML/JS/CSS in a Node stage, and then statically served using a lightweight Nginx image. The Node runtime is entirely omitted from the final production image.

### Why GitHub Actions?
- **Continuous Integration:** The `.github/workflows/main.yml` pipeline ensures that every push is automatically verified. Running `vitest` and `pytest` in the CI pipeline guarantees that regressions are caught immediately before they reach production.
