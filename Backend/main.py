from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

from services.screener_service import get_stock_details

app = FastAPI(
    title="GrowUp Screener API",
    description="Stock detail data API powered by screener.in",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/stocks/{symbol}")
def stock_details(
    symbol: str,
    view: str = Query(default="consolidated", description="consolidated or standalone"),
):
    if view not in ("consolidated", "standalone", ""):
        raise HTTPException(status_code=400, detail="view must be 'consolidated' or 'standalone'")

    try:
        data = get_stock_details(symbol, view if view else "standalone")
        return data
    except requests.exceptions.HTTPError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Stock '{symbol.upper()}' not found on screener.in",
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to fetch data from screener.in. Please try again later.",
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
