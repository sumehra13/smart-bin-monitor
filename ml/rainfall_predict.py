import pickle
import pandas as pd
import os
import random
from datetime import datetime, timedelta

# Load trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model.pkl")

with open(model_path, "rb") as f:
    model = pickle.load(f)

def predict_weekly_rainfall():
    today = datetime.now()
    forecast = []

    for i in range(1, 8):  # From tomorrow
        date = today + timedelta(days=i)

        # 🔹 Vary atmospheric conditions for realism
        humidity = random.choice([55, 60, 65, 70, 80, 85])
        pressure = random.choice([1008, 1010, 1012, 1015, 1018])
        temperature = random.uniform(26, 34)
        wind_speed = random.uniform(2, 8)

        input_df = pd.DataFrame([{
            "Temperature": temperature,
            "Humidity": humidity,
            "Pressure": pressure,
            "WindSpeed": wind_speed
        }])

        rainfall = round(float(model.predict(input_df)[0]), 2)

        # 🌧 Rain classification
        if rainfall < 3:
            status = "No Rain"
        elif rainfall < 8:
            status = "Light Rain"
        else:
            status = "Heavy Rain"

        forecast.append({
            "date": date.strftime("%d-%m-%Y"),
            "day": date.strftime("%A"),
            "rainfall_mm": rainfall,
            "status": status
        })

    return forecast
