from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routes import router

app = FastAPI(title="Γύρνα. API", version="1.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True, allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)


@app.middleware("http")
async def response_headers(request: Request, call_next):
    if int(request.headers.get("content-length", "0")) > 2_000_000:
        return JSONResponse({"detail": "Το αίτημα είναι πολύ μεγάλο."}, status_code=413)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(_request, exc):
    # Do not echo private input values or Pydantic exception objects.
    return JSONResponse(status_code=422, content={
        "detail": "Μη έγκυρα δεδομένα.",
        "errors": [{"loc": e["loc"], "msg": e["msg"]} for e in exc.errors()],
    })


app.include_router(router)
