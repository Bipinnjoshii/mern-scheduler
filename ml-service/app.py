"""
ML microservice for the CPU Scheduling Simulator.

Predicts a process's NEXT burst time from its past burst-time history,
using linear regression (scikit-learn). This mirrors a real OS problem:
schedulers like SJF/SRTF need to know burst time in advance, but a real
OS never actually knows the future -- it has to predict it from a
process's past behavior.

Endpoints:
  POST /predict          -> single prediction + model evaluation stats
  GET  /health            -> simple health check
"""

from flask import Flask, request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    # Allow the Express server (running on a different port) to call this API.
    # Hand-rolled instead of using the flask-cors package, to keep this
    # service to a single dependency (scikit-learn) beyond Flask itself.
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "burst-time-predictor"})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Request body:  { "history": [5, 7, 6, 8, 7, 9] }
    (a process's last N actual burst times, in order)

    Response body:
    {
      "predictedBurstTime": 9.2,
      "slope": 0.63,
      "intercept": 5.1,
      "mse": 0.84,      # only present if there's enough data to test on
      "r2": 0.71,       # only present if there's enough data to test on
      "pointsUsed": 6
    }
    """
    data = request.get_json(silent=True) or {}
    history = data.get("history")

    if not isinstance(history, list) or len(history) < 2:
        return jsonify({
            "error": "Provide 'history' as a list of at least 2 past burst times."
        }), 400

    try:
        history = [float(h) for h in history]
    except (TypeError, ValueError):
        return jsonify({"error": "All history values must be numbers."}), 400

    # X = time index (0, 1, 2, ...), y = burst time at that index
    X = np.arange(len(history)).reshape(-1, 1)
    y = np.array(history)

    result = {"pointsUsed": len(history)}

    # If we have enough points, hold out the last one as a "test" point
    # to demonstrate real train/test evaluation (MSE, R^2).
    if len(history) >= 4:
        X_train, y_train = X[:-1], y[:-1]
        X_test, y_test = X[-1:], y[-1:]

        eval_model = LinearRegression()
        eval_model.fit(X_train, y_train)
        y_pred_test = eval_model.predict(X_test)

        result["mse"] = round(float(mean_squared_error(y_test, y_pred_test)), 3)
        # R^2 needs >1 test point to be meaningful; report None otherwise
        result["r2"] = None

    # Fit the FINAL model on all available history to predict the next point
    model = LinearRegression()
    model.fit(X, y)

    next_index = np.array([[len(history)]])
    predicted = model.predict(next_index)[0]

    # Burst time can't be negative or zero in real scheduling -- clamp it
    predicted = max(1.0, float(predicted))

    result["predictedBurstTime"] = round(predicted, 2)
    result["slope"] = round(float(model.coef_[0]), 3)
    result["intercept"] = round(float(model.intercept_), 3)

    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
