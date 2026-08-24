from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.routers import (
    auth,
    users,
    vehicles,
    addresses,
    services,
    bookings,
    offers,
    notifications,
    employees,
    admin
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.railway\.app|https://.*\.onrender\.com|https://.*\.netlify\.app|https://.*\.aquago\.in",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file uploads directory
os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIRECTORY), name="uploads")

# Register API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(addresses.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    try:
        from seed import seed
        from migrate_db import run_migration
        from migrate_db_v2 import migrate_v2
        print("[Startup] Initializing database schema & migrations...")
        seed()
        run_migration()
        migrate_v2()
        print("[Startup] Database initialization completed.")
    except Exception as e:
        print(f"[Startup] Database initialization note: {e}")

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "ok"
    }

@app.get("/", tags=["Health"])
def root_redirect():
    return {
        "message": "Welcome to AquaGo Mobile Water Wash API",
        "docs": "/docs",
        "version": settings.VERSION
    }
