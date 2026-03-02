from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from tensorflow import keras

app = FastAPI()

# Load trained model once
model = keras.models.load_model("match_predictor_model.h5", compile=False)

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
        prob = abs(h1 - h2) / (abs(h1) + abs(h2) + 1e-6) * 100

        return {
            "fairness": "Fair Match" if prob < 15 else "Unbalanced Match",
            "dominance": {
                "player": dominant,
                "probability": round(float(prob), 2)
            },
            "mode": "quick-heuristic"
        }

        # ---------- DEEP LEARNING (Hybrid Confidence) ----------
    X = np.array([
        [p1.height, p1.weight, p1.age, p1.experience],
        [p2.height, p2.weight, p2.age, p2.experience]
    ], dtype=np.float32)

    preds = model.predict(X, verbose=0).flatten()

    # base decision from heuristic
    dominant = "Player 1" if h1 > h2 else "Player 2"
    base_prob = abs(h1 - h2) / (abs(h1) + abs(h2) + 1e-6) * 100

    # deep model only adjusts confidence slightly
    dl_adjust = float(preds[0] - preds[1]) * 10  # small adjustment

    final_prob = max(50, min(100, base_prob + dl_adjust))

    return {
        "fairness": "Fair Match" if final_prob < 60 else "Unbalanced Match",
        "dominance": {
            "player": dominant,
            "probability": round(float(final_prob), 2)
        },
        "mode": "hybrid-ai"
    }