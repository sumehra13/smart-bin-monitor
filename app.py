from flask import Flask, jsonify
from flask_cors import CORS
from ml.rainfall_predict import predict_weekly_rainfall

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "FixMyCity Backend Running"

@app.route("/rainfall_prediction")
def rainfall_prediction():
    weekly_forecast = predict_weekly_rainfall()

    heavy_days = sum(1 for d in weekly_forecast if d["status"] == "Heavy Rain")
    overall_priority = "HIGH" if heavy_days >= 2 else "NORMAL"

    return jsonify({
        "forecast": weekly_forecast,
        "overall_priority": overall_priority
    })


if __name__ == "__main__":
    app.run(debug=True)
