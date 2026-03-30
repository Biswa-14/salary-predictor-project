# PayLens

PayLens is a full-stack salary intelligence app for technical roles. It predicts market-aligned salaries using a trained machine learning model, then layers in practical context like cost of living, tax drag, currency conversion, regional hiring conditions, and role demand.

The project is built as a portfolio-grade product: a React + Vite frontend, a FastAPI backend, a trained salary model, and deployment on Vercel + Render.

## What It Does

- Predicts salaries for technical and data-focused roles
- Supports multiple countries and live currency conversion
- Shows nominal vs COL-adjusted salary views
- Adds regional context such as market competitiveness, visa friction, work culture, and tech scene
- Includes trend visualizations, demand signals, salary breakdowns, and recent prediction history
- Works across desktop and mobile with responsive UI adjustments

## Scope

PayLens is tuned around technical careers such as:

- Data Scientist
- Machine Learning Engineer
- Analytics Engineer
- Data Engineer
- BI Developer
- Software Engineer
- Other adjacent technical and specialist roles present in the model dataset

It is not intended to be a general salary estimator for all professions.

## Tech Stack

### Frontend

- React
- Vite
- Recharts
- Axios
- Vercel Analytics

### Backend

- FastAPI
- scikit-learn
- pandas
- numpy
- joblib
- httpx

### Deployment

- Vercel for the frontend
- Render for the backend
- UptimeRobot for optional backend health pinging

## Project Structure

```text
salary-predictor/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── models/
│   └── data/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vercel.json
├── DEPLOYMENT.md
├── render.yaml
└── README.md
```

## Key Features

### Salary Prediction

PayLens predicts salary using a trained regression model and adjusts the estimate using:

- experience level
- employment type
- company size
- remote ratio
- company location
- inflation year
- role demand
- cost of living
- tax impact
- regional market conditions

### Interactive Frontend

- Searchable job selector
- Country-aware location selector with full country names
- Multi-currency salary view
- Shareable prediction URLs
- COL toggle
- Mobile-friendly navigation and input flows

### Context Layer

PayLens goes beyond a raw number by showing:

- salary range
- take-home estimate
- role trend
- demand/hype indicators
- regional context
- technical market notes

## Local Development

## Prerequisites

- Node.js 18+
- Python 3.10+
- pip

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run at:

```text
http://localhost:8000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## Frontend Environment Variable

Create `frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:8000
```

For production, set `VITE_API_URL` to your deployed Render backend URL.

## Available Backend Endpoints

### `GET /health`

Health check endpoint for Render or UptimeRobot.

### `GET /options`

Returns valid dropdown options such as:

- job titles
- company locations
- experience levels
- employment types
- company sizes
- work years

### `POST /predict`

Accepts a prediction payload and returns:

- predicted salary in USD
- converted salary in INR
- range low/high
- exchange rate metadata

## Deployment

Detailed deployment notes live in [DEPLOYMENT.md](C:\Users\LOQ\OneDrive\Documents\salary-predictor\DEPLOYMENT.md).

### Backend on Render

- Create a `Web Service`
- Root directory: `backend`
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

### Frontend on Vercel

- Import the same repository
- Root directory: `frontend`
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

## Production Notes

- Render free instances may sleep after inactivity
- UptimeRobot can be pointed at `/health` to reduce cold starts
- Vercel handles the frontend separately, so your local PC does not need to stay on after deployment

## Why This Project Matters

PayLens was built to make salary estimation more honest and more useful than a flat benchmark. Instead of showing a single disconnected figure, it tries to answer:

- What should this role earn in this market?
- How does cost of living change the picture?
- What might take-home pay actually feel like?
- How strong is the market for this role right now?

That makes it a stronger product and a stronger ML portfolio project than a basic predictor demo.

## Author

Built by **Biswaranjan Nayak**

- GitHub: [Biswa-14](https://github.com/Biswa-14)
- LinkedIn: [Biswaranjan Nayak](https://www.linkedin.com/in/biswaranjan-nayak-063809299/)
- Email: [biswanyk14@outlook.com](mailto:biswanyk14@outlook.com)
