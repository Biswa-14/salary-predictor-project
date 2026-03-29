# main.py — FastAPI backend
import httpx  # add this to your imports at the top
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os

from utils import load_encoders, encode_features, get_feature_columns

# ── 1. BOOT ───────────────────────────────────────────────────
app = FastAPI(title="Salary Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your Vercel URL after deploy
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + encoders ONCE at startup (not per request)
model    = joblib.load("models/salary_model.pkl")
encoders = load_encoders()
FEATURES = get_feature_columns()

print("Model and encoders loaded successfully")

# ── 2. REQUEST SCHEMA ─────────────────────────────────────────
# Pydantic validates every incoming request automatically.
# If the React app sends the wrong type, FastAPI returns a
# clear 422 error before your code even runs.
class PredictRequest(BaseModel):
    experience_level: str   # "EN", "MI", "SE", "EX"
    employment_type:  str   # "FT", "PT", "CT", "FL"
    job_title:        str   # "Data Scientist", "ML Engineer", etc.
    remote_ratio:     int   # 0, 50, or 100
    company_location: str   # "US", "IN", "GB", etc.
    company_size:     str   # "S", "M", "L"
    work_year:        int   # 2020 – 2023



def apply_year_adjustment(salary_usd: float, work_year: int) -> float:
    """
    The model was trained on data up to 2023.
    For years beyond 2023, apply ~5% annual tech salary inflation.
    """
    base_year = 2023
    if work_year <= base_year:
        return salary_usd
    years_ahead = work_year - base_year
    return salary_usd * (1.05 ** years_ahead)    

# ── 3. PREDICTION ENDPOINT ───────────────────────────────────
def get_usd_to_inr() -> float:
    """
    Fetch live USD → INR rate from a free public API.
    Falls back to a hardcoded rate if the request fails.
    """
    try:
        response = httpx.get(
            "https://api.exchangerate-api.com/v4/latest/USD",
            timeout=3.0
        )
        return response.json()["rates"]["INR"]
    except Exception:
        return 83.5   # fallback if API is down

@app.post("/predict")
def predict_salary(data: PredictRequest):
    try:
        row = pd.DataFrame([{
            "experience_level": data.experience_level,
            "employment_type":  data.employment_type,
            "job_title":        data.job_title,
            "remote_ratio":     data.remote_ratio,
            "company_location": data.company_location,
            "company_size":     data.company_size,
            "work_year":        data.work_year,
        }])

        row_encoded   = encode_features(row, encoders)
        X             = row_encoded[FEATURES]
        log_pred      = model.predict(X)[0]
        predicted_usd = float(np.expm1(log_pred))
        predicted_usd = apply_year_adjustment(predicted_usd, data.work_year)

        # Live conversion
        inr_rate      = get_usd_to_inr()
        predicted_inr = predicted_usd * inr_rate

        return {
            "predicted_salary_usd": round(predicted_usd),
            "predicted_salary_inr": round(predicted_inr),
            "range_low_usd":        round(predicted_usd * 0.80),
            "range_high_usd":       round(predicted_usd * 1.20),
            "range_low_inr":        round(predicted_inr * 0.80),
            "range_high_inr":       round(predicted_inr * 1.20),
            "usd_to_inr_rate":      round(inr_rate, 2),
            "currency_note":        "INR conversion uses live exchange rate"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── 4. DROPDOWN OPTIONS ENDPOINT ──────────────────────────────
# React will call this on load to populate its dropdowns
# so they're always in sync with what the model actually knows
@app.get("/options")
def get_options():
    return {
        "experience_level": {
            "EN": "Entry level",
            "MI": "Mid level",
            "SE": "Senior",
            "EX": "Executive"
        },
        "employment_type": {
            "FT": "Full time",
            "PT": "Part time",
            "CT": "Contract",
            "FL": "Freelance"
        },
        "company_size": {
            "S": "Small",
            "M": "Medium",
            "L": "Large"
        },
        "remote_ratio": [0, 50, 100],
        "work_year": [2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "job_titles":   sorted(encoders["job_title"]["mapping"].keys()),
        "locations":    sorted(encoders["company_location"]["mapping"].keys()),
    }

# ── 5. HEALTH CHECK ───────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model_features": FEATURES}


