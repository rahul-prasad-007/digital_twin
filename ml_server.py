from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)

# Synthetic training data for fill prediction based on current fill and time ahead.
# In a real deployment, replace this with historical bin fill logs from your sensors.
X = np.array([
    [0, 1], [0, 2], [0, 3],
    [20, 1], [20, 2], [20, 3],
    [40, 1], [40, 2], [40, 3],
    [60, 1], [60, 2], [60, 3],
    [80, 1], [80, 2], [80, 3],
    [95, 1], [95, 2], [95, 3],
])
y = np.array([
    10, 18, 24,
    25, 38, 50,
    45, 58, 70,
    60, 78, 94,
    85, 98, 100,
    98, 100, 100,
])

model = RandomForestRegressor(n_estimators=50, random_state=42)
model.fit(X, y)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}
    current_fill = float(data.get('fill', 0))
    time = float(data.get('time', 2))  # hours ahead

    prediction = model.predict([[current_fill, time]])[0]
    prediction = min(100, max(0, prediction))

    return jsonify({
        "predicted_fill": round(prediction, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)