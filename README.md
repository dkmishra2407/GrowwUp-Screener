# GrowUp Screener

Stock screener app with a React frontend and a FastAPI backend that fetches data from [screener.in](https://www.screener.in).

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm

## Project structure

```
GrowUp Screener/
├── Backend/     # FastAPI API (port 8000)
└── Frontend/    # React + Vite app (port 5173)
```

## Run the backend

1. Open a terminal and go to the backend folder:

   ```bash
   cd Backend
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the API server:

   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

   The backend runs at [http://127.0.0.1:8000](http://127.0.0.1:8000).

4. Verify it is running:

   - Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
   - API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

> **Note:** `python main.py` does not start the server. Use the `uvicorn` command above.

## Run the frontend

1. Open a **second** terminal and go to the frontend folder:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app opens at [http://localhost:5173](http://localhost:5173).

The frontend proxies `/api` requests to the backend at `http://127.0.0.1:8000`, so **start the backend first**.

## Quick start (both apps)

**Terminal 1 — Backend:**

```bash
cd Backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend:**

```bash
cd Frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/stocks/{symbol}?view=consolidated` | Stock details (use `view=standalone` for standalone data) |

## Production build (frontend)

```bash
cd Frontend
npm run build
npm run preview
```

For production, set `VITE_API_URL` to your deployed backend URL if the API is not on the same origin.
