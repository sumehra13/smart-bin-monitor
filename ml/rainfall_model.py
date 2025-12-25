import pandas as pd
import pickle
import os
from sklearn.ensemble import RandomForestRegressor

# Get current directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load dataset
csv_path = os.path.join(BASE_DIR, "rainfall_data.csv")
data = pd.read_csv(csv_path)

# Features and target
X = data[['Temperature', 'Humidity', 'Pressure', 'WindSpeed']]
y = data['Rainfall']

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
model.fit(X, y)

# Save model
model_path = os.path.join(BASE_DIR, "model.pkl")
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print("✅ Rainfall model trained and saved as model.pkl")
