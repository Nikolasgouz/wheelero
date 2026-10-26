"""Serve pre-rendered public pages and built assets, never repository files."""
from html import escape
from pathlib import Path

from fastapi import HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.staticfiles import StaticFiles

from .config import settings

DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
PUBLIC_PATHS = {"/", "/random-name-picker", "/yes-no-wheel", "/random-number-wheel",
                "/random-team-generator", "/about", "/privacy"}


def public_html(path: str, origin: str, indexable: bool):
    file = DIST / ("index.html" if path == "/" else path.lstrip("/") + "/index.html")
    if not file.is_file():
        raise HTTPException(503, "Build the frontend before starting the public website.")
    return file.read_text(encoding="utf-8").replace(
        "__PUBLIC_ORIGIN__", escape(origin, quote=True)
    ).replace("__ROBOTS__", "index,follow" if indexable else "noindex,nofollow")


def install_web(app):
    assets = StaticFiles(directory=DIST, check_dir=False)

    @app.get("/robots.txt", include_in_schema=False)
    def robots():
        content = "User-agent: *\nDisallow: /\n"
        if settings.public_indexing:
            content = ("User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /*?share=\n"
                       f"Sitemap: {settings.public_url}/sitemap.xml\n")
        return Response(content, media_type="text/plain")

    @app.get("/sitemap.xml", include_in_schema=False)
    def sitemap():
        urls = "".join(f"<url><loc>{escape(settings.public_url + path)}</loc></url>"
                       for path in sorted(PUBLIC_PATHS)) if settings.public_url else ""
        return Response('<?xml version="1.0" encoding="UTF-8"?>'
                        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                        + urls + "</urlset>", media_type="application/xml")

    @app.get("/{path:path}", include_in_schema=False)
    async def website(request: Request, path: str):
        route = "/" + path
        if route.endswith("/index.html"):
            route = route.removesuffix("index.html").rstrip("/") or "/"
        if path.startswith("api/"):
            raise HTTPException(404, "Endpoint not found.")
        if route != "/" and route.endswith("/") and route.rstrip("/") in PUBLIC_PATHS:
            return RedirectResponse(route.rstrip("/"), status_code=308)
        origin = settings.public_url or str(request.base_url).rstrip("/")
        if route in PUBLIC_PATHS:
            return HTMLResponse(public_html(route, origin,
                                settings.public_indexing and not request.query_params))
        try:
            return await assets.get_response(path, request.scope)
        except StarletteHTTPException as error:
            if error.status_code != 404:
                raise
            return HTMLResponse(public_html("/404", origin, False), status_code=404)
