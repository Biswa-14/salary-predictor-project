# train.py
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from utils import (
    remove_outliers, fit_target_encoders,
    encode_features, get_feature_columns
)

# 1. Load
df = pd.read_csv("data/salary_data_clean.csv")
print(f"Loaded {len(df)} rows")

# 2. Drop columns we don't need
df = df.drop(columns=["salary", "salary_currency", "employee_residence"])

# 3. Outlier removal on USD salary
df = remove_outliers(df, col="salary_in_usd")
print(f"After outlier removal: {len(df)} rows")
print(f"Salary range: ${df['salary_in_usd'].min():,.0f} – ${df['salary_in_usd'].max():,.0f}")

# 4. Log transform target
# salary_in_usd is still somewhat skewed — log helps the model
df["log_salary"] = np.log1p(df["salary_in_usd"])

# 5. Target encode categorical columns
encoders = fit_target_encoders(df)
df = encode_features(df, encoders)

# 6. Split X and y
FEATURES = get_feature_columns()
X = df[FEATURES]
y = df["log_salary"]

print(f"\nFeatures: {FEATURES}")
print(f"X shape: {X.shape}")

# 7. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 8. Train
model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
print("\nTraining model...")
model.fit(X_train, y_train)
print("Done!")

# 9. Evaluate — convert back from log to USD for readable MAE
log_pred      = model.predict(X_test)
actual_pred   = np.expm1(log_pred)
actual_actual = np.expm1(y_test)

mae = mean_absolute_error(actual_actual, actual_pred)
r2  = r2_score(y_test, log_pred)

print(f"\n=== Model Performance ===")
print(f"MAE : ${mae:,.0f}  (average error in USD)")
print(f"R²  : {r2:.3f}")
print(f"\nModel explains {r2*100:.1f}% of salary variance")

# 10. Save
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/salary_model.pkl")
print(f"\nModel saved  → models/salary_model.pkl")