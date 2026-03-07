from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from tensorflow import keras
import joblib

app = FastAPI()

# Load trained model once
model = keras.models.load_model("match_predictor_model.h5", compile=False)
try:
    scaler = joblib.load("scaler.save")
except FileNotFoundError:
    scaler = None

class Player(BaseModel):
    height: float
    weight: float
    age: float
    experience: float

class MatchRequest(BaseModel):
    player1: Player
    player2: Player
    useDeepModel: bool = False  # decides quick vs deep

def heuristic_score(p):
    return 0.3*p.height + 0.3*p.weight + 0.2*p.experience - 0.1*p.age

@app.post("/predict")
def predict_match(data: MatchRequest):
    p1 = data.player1
    p2 = data.player2

    # ---------- QUICK HEURISTIC ----------
    h1 = heuristic_score(p1)
    h2 = heuristic_score(p2)

    if not data.useDeepModel:
        dominant = "Player 1" if h1 > h2 else "Player 2"
        raw_prob = abs(h1 - h2) / (abs(h1) + abs(h2) + 1e-6) * 100
        prob = 50 + (raw_prob / 2) # Normalize to 50-100% confidence scale

        return {
            "fairness": "Fair Match" if prob < 60 else "Unbalanced Match",
            "dominance": {
                "player": dominant,
                "probability": round(float(prob), 2)
            },
            "mode": "quick-heuristic"
        }

    # ---------- DEEP LEARNING (Hybrid Confidence) ----------
    X = np.array([[
        p1.height, p1.weight, p1.age, p1.experience,
        p2.height, p2.weight, p2.age, p2.experience
    ]], dtype=np.float32)

    if scaler:
        X = scaler.transform(X)

    preds = model.predict(X, verbose=0)
    prob_p1 = float(preds[0][0])
    
    if prob_p1 >= 0.5:
        dominant = "Player 1"
        final_prob = prob_p1 * 100
    else:
        dominant = "Player 2"
        final_prob = (1.0 - prob_p1) * 100

    return {
        "fairness": "Fair Match" if final_prob < 60 else "Unbalanced Match",
        "dominance": {
            "player": dominant,
            "probability": round(final_prob, 2)
        },
        "mode": "hybrid-ai"
    }