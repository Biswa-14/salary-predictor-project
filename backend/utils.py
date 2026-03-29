# utils.py
import pandas as pd
import numpy as np
import joblib
import os

ENCODERS_PATH    = "models/encoders.pkl"
CATEGORICAL_COLS = [
    "experience_level", "employment_type",
    "job_title", "company_location", "company_size"
]

def remove_outliers(df, col="salary_in_usd", lower=0.01, upper=0.99):
    lo = df[col].quantile(lower)
    hi = df[col].quantile(upper)
    return df[(df[col] >= lo) & (df[col] <= hi)]

def fit_target_encoders(df):
    """
    Target encoding: replace each category with its mean salary_in_usd.
    e.g. "SE" (Senior Engineer) → mean salary of all SE rows = $145,000
    Saved so prediction uses the exact same mapping.
    """
    encoders = {}
    for col in CATEGORICAL_COLS:
        mapping     = df.groupby(col)["salary_in_usd"].mean().to_dict()
        global_mean = df["salary_in_usd"].mean()
        encoders[col] = {"mapping": mapping, "global_mean": global_mean}

    os.makedirs("models", exist_ok=True)
    joblib.dump(encoders, ENCODERS_PATH)
    print(f"Encoders saved → {ENCODERS_PATH}")
    return encoders

def load_encoders():
    return joblib.load(ENCODERS_PATH)

def encode_features(df, encoders):
    df = df.copy()
    for col in CATEGORICAL_COLS:
        mapping     = encoders[col]["mapping"]
        global_mean = encoders[col]["global_mean"]
        df[col] = df[col].astype(str).map(mapping).fillna(global_mean)
    return df

def get_feature_columns():
    return [
        "experience_level", "employment_type", "job_title",
        "remote_ratio", "company_location", "company_size", "work_year"
    ]