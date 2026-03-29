import pandas as pd

df = pd.read_csv("data/salary_data.csv")

print("=== First 5 rows ===")
print(df.head())
print("\n=== Shape ===")
print(df.shape)
print("\n=== Info ===")
print(df.info())
print("\n=== Missing values ===")
print(df.isnull().sum())
print("\n=== Stats ===")
print(df.describe())

# Clean
df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
df = df.dropna()
df = df.drop_duplicates()

df.to_csv("data/salary_data_clean.csv", index=False)
print(f"\nSaved {len(df)} clean rows")
print(df.columns.tolist())