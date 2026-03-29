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

def calculate_total_adv(p1, p2):
    height_adv = (p1.height - p2.height) * 0.2
    weight_adv = (p1.weight - p2.weight) * 0.1
    exp_adv = (p1.experience - p2.experience) * 3.0
    age_adv = (p2.age - p1.age) * 0.5
    return height_adv + weight_adv + exp_adv + age_adv

@app.post("/predict")
def predict_match(data: MatchRequest):
    p1 = data.player1
    p2 = data.player2

    # ---------- QUICK HEURISTIC ----------
    if not data.useDeepModel:
        total_adv = calculate_total_adv(p1, p2)
        clamped_adv = max(-45.0, min(45.0, total_adv))
        p1_prob = 50.0 + clamped_adv
        
        dominant = "Player 1" if p1_prob >= 50 else "Player 2"
        final_prob = p1_prob if p1_prob >= 50 else (100.0 - p1_prob)
        fairness = "Fair Match" if abs(clamped_adv) < 15 else "Unbalanced Match"

        return {
            "fairness": fairness,
            "dominance": {
                "player": dominant,
                "probability": round(float(final_prob), 2)
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