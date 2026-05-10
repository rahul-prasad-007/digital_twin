from flask import Flask, request, jsonify, make_response
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import json

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-in-production"
app.config["JWT_EXP_HOURS"] = 6


@app.before_request
def _cors_preflight():
    if request.method != "OPTIONS":
        return None
    resp = make_response("", 204)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
    return resp


@app.after_request
def _cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
    return response


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_segment = _b64url_encode(
        json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    payload_segment = _b64url_encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signing_input = f"{header_segment}.{payload_segment}".encode("utf-8")
    signature = hmac.new(
        app.config["SECRET_KEY"].encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    return f"{header_segment}.{payload_segment}.{_b64url_encode(signature)}"


def decode_jwt(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token format")

    header_segment, payload_segment, signature_segment = parts
    signing_input = f"{header_segment}.{payload_segment}".encode("utf-8")
    expected_signature = hmac.new(
        app.config["SECRET_KEY"].encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    provided_signature = _b64url_decode(signature_segment)

    if not hmac.compare_digest(expected_signature, provided_signature):
        raise ValueError("Invalid token signature")

    payload = json.loads(_b64url_decode(payload_segment).decode("utf-8"))
    exp = payload.get("exp")
    if exp is None:
        raise ValueError("Token missing exp claim")
    now_ts = int(datetime.now(timezone.utc).timestamp())
    if now_ts >= int(exp):
        raise ValueError("Token expired")
    return payload


def get_bearer_token() -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return ""
    return auth_header.split(" ", 1)[1].strip()


def require_auth():
    token = get_bearer_token()
    if not token:
        return None, (jsonify({"message": "Missing bearer token"}), 401)
    try:
        payload = decode_jwt(token)
        return payload, None
    except Exception as error:
        return None, (jsonify({"message": str(error)}), 401)


# In-memory user store for demo use only.
# Replace with a database and hashed+salted passwords in production.
users = {
    "admin": {
        "email": "admin@example.com",
        "password": "1234",
    }
}
citizen_reports = []
next_report_id = 1

AREA_INDEX = {
    "office": 0,
    "residential": 1,
    "market": 2,
}


def _clamp(value: float, low: float, high: float) -> float:
    return min(high, max(low, value))


def _to_float(value, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _encode_area(area: str) -> int:
    normalized = str(area or "").strip().lower()
    return AREA_INDEX.get(normalized, 1)


def _build_features(fill: float, time_hours: float, temperature: float, gas: float, area: str):
    area_code = _encode_area(area)
    return [fill, time_hours, temperature, gas, area_code]


def _generate_synthetic_training_data():
    samples = []
    labels = []
    rng = np.random.default_rng(42)
    areas = list(AREA_INDEX.keys())

    for fill in range(0, 101, 5):
        for time_hours in [1, 2, 3, 4, 6]:
            for area in areas:
                for _ in range(4):
                    temperature = float(rng.uniform(18, 36))
                    gas = float(rng.uniform(8, 90))
                    area_code = _encode_area(area)

                    # Synthetic target logic with reasonable monotonic behavior.
                    growth = (
                        time_hours * 6.0
                        + (temperature - 25) * 0.35
                        + gas * 0.06
                        + area_code * 1.8
                        + rng.normal(0, 1.8)
                    )
                    predicted_fill = _clamp(fill + growth, 0, 100)

                    samples.append([fill, time_hours, temperature, gas, area_code])
                    labels.append(predicted_fill)

    return np.array(samples, dtype=float), np.array(labels, dtype=float)


X, y = _generate_synthetic_training_data()
model = RandomForestRegressor(n_estimators=180, random_state=42)
model.fit(X, y)

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json or {}
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip()
    password = str(data.get('password', ''))

    if not username or not email or not password:
        return jsonify({"message": "username, email and password are required"}), 400

    if username in users:
        return jsonify({"message": "Username already exists"}), 409

    users[username] = {
        "email": email,
        "password": password,
    }
    return jsonify({"message": "Account created successfully"}), 201


@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))
    user = users.get(username)

    if not user or user.get("password") != password:
        return jsonify({"message": "Invalid credentials"}), 401

    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=app.config["JWT_EXP_HOURS"])
    token = create_jwt({
        "sub": username,
        "email": user.get("email", ""),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    })
    return jsonify({"token": token})


@app.route('/auth/me', methods=['GET'])
def me():
    payload, auth_error = require_auth()
    if auth_error:
        return auth_error
    return jsonify({
        "username": payload.get("sub"),
        "email": payload.get("email"),
    })


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}
    current_fill = _clamp(_to_float(data.get('fill', 0), 0), 0, 100)
    time_hours = _clamp(_to_float(data.get('time', 2), 2), 0.5, 12)
    temperature = _clamp(_to_float(data.get('temperature', 25), 25), -10, 70)
    gas = _clamp(_to_float(data.get('gas', 20), 20), 0, 100)
    area = str(data.get('area', 'residential')).strip().lower()

    feature_vector = _build_features(
        fill=current_fill,
        time_hours=time_hours,
        temperature=temperature,
        gas=gas,
        area=area,
    )

    prediction = float(model.predict([feature_vector])[0])
    prediction = _clamp(prediction, 0, 100)

    return jsonify({
        "predicted_fill": round(prediction, 2),
        "model_version": "rf-v2",
        "inputs_used": {
            "fill": current_fill,
            "time": time_hours,
            "temperature": temperature,
            "gas": gas,
            "area": area,
        },
    })


@app.route('/reports', methods=['GET'])
def get_reports():
    sorted_reports = sorted(citizen_reports, key=lambda r: r["timestamp"], reverse=True)
    return jsonify({"reports": sorted_reports})


@app.route('/reports', methods=['POST'])
def create_report():
    global next_report_id

    data = request.json or {}
    report_type = str(data.get("type", "")).strip()
    location = data.get("location") or {}
    lat = _to_float(location.get("lat"), None)
    lng = _to_float(location.get("lng"), None)

    if report_type not in {"Overflow", "Dirty Area"}:
        return jsonify({"message": "Invalid report type"}), 400
    if lat is None or lng is None:
        return jsonify({"message": "Valid location is required"}), 400

    report = {
        "id": next_report_id,
        "type": report_type,
        "location": {"lat": lat, "lng": lng},
        "status": "open",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "createdBy": str(data.get("createdBy") or "local"),
    }
    next_report_id += 1
    citizen_reports.append(report)
    return jsonify(report), 201


@app.route('/reports/<int:report_id>/resolve', methods=['PATCH'])
def resolve_report(report_id: int):
    for report in citizen_reports:
        if report["id"] == report_id:
            report["status"] = "resolved"
            return jsonify(report)
    return jsonify({"message": "Report not found"}), 404


@app.route('/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id: int):
    for idx, report in enumerate(citizen_reports):
        if report["id"] == report_id:
            citizen_reports.pop(idx)
            return jsonify({"message": "Report deleted"})
    return jsonify({"message": "Report not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)