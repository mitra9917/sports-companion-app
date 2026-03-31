from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from tensorflow.keras.models import load_model
import joblib

app = FastAPI()

# --- 1. GLOBALLY LOAD MODEL & SCALER ---
# We put this in a try/except block so the API doesn't crash if the files are missing
try:
    model = load_model('match_predictor_model.h5')
except Exception as e:
    print(f"Warning: Could not load model. Error: {e}")
    model = None

try:
    scaler = joblib.load("scaler.save")
except FileNotFoundError:
    print("Warning: scaler.save not found. Proceeding without scaler.")
    scaler = None


# --- 2. DEFINE DATA STRUCTURES ---
class Player(BaseModel):
    height: float
    weight: float
    age: float
    experience: float

class MatchRequest(BaseModel):
    player1: Player
    player2: Player
    useDeepModel: bool = False  # decides quick vs deep


# --- 3. HELPER FUNCTION ---
def calculate_total_adv(p1: Player, p2: Player):
# --- HEALTH CHECK ENDPOINT ---
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "sports-ml-predictor",
        "predict_endpoint": "/predict_compatibility", 
    }

# --- 3. HELPER FUNCTION ---
def calculate_total_adv(p1: Player, p2: Player):
    height_adv = (p1.height - p2.height) * 0.2
    weight_adv = (p1.weight - p2.weight) * 0.1
    exp_adv = (p1.experience - p2.experience) * 3.0
    age_adv = (p2.age - p1.age) * 0.5
    return height_adv + weight_adv + exp_adv + age_adv


# --- 4. THE PREDICTION ENDPOINT ---
@app.post("/predict_compatibility")
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
            "success": True,
            "fairness": fairness,
            "dominance": {
                "player": dominant,
                "probability": round(float(final_prob), 2)
            },
            "mode": "quick-heuristic"
        }

    # ---------- DEEP LEARNING (Hybrid Confidence) ----------
    if model is None:
        raise HTTPException(status_code=500, detail="Deep learning model not loaded. Check server logs.")

    # Format the input exactly as the model expects
    X = np.array([[
        p1.height, p1.weight, p1.age, p1.experience,
        p2.height, p2.weight, p2.age, p2.experience
    ]], dtype=np.float32)

    if scaler:
        X = scaler.transform(X)

    # Make the prediction
    preds = model.predict(X, verbose=0)
    prob_p1 = float(preds[0][0])
    
    if prob_p1 >= 0.5:
        dominant = "Player 1"
        final_prob = prob_p1 * 100
    else:
        dominant = "Player 2"
        final_prob = (1.0 - prob_p1) * 100

    return {
        "success": True,
        "fairness": "Fair Match" if final_prob < 60 else "Unbalanced Match",
        "dominance": {
            "player": dominant,
            "probability": round(final_prob, 2)
        },
        "mode": "hybrid-ai"
    }
