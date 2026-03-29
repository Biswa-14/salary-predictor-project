# Deployment

## Backend on Render

- Create a new `Web Service`
- Connect this GitHub repo
- Use `backend` as the root directory
- Build command:

```bash
pip install -r requirements.txt
```

- Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

- Health check path:

```text
/health
```

## Frontend on Vercel

- Import the same GitHub repo
- Use `frontend` as the root directory
- Framework preset: `Vite`
- Build command:

```bash
npm run build
```

- Output directory:

```text
dist
```

- Environment variable:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

## Optional uptime monitor

After the Render deploy succeeds, point UptimeRobot at:

```text
https://your-render-service.onrender.com/health
```
