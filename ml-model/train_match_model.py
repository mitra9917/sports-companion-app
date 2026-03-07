# train_match_model.py
import numpy as np
import pandas as pd
from tensorflow import keras
from sklearn.preprocessing import StandardScaler
import joblib

# -------- Synthetic Training Data --------
np.random.seed(42)

data_size = 2000

# Player 1 stats
p1_h = np.random.randint(150, 200, data_size)
p1_w = np.random.randint(50, 100, data_size)
p1_a = np.random.randint(18, 45, data_size)
p1_e = np.random.randint(0, 15, data_size)

# Player 2 stats
p2_h = np.random.randint(150, 200, data_size)
p2_w = np.random.randint(50, 100, data_size)
p2_a = np.random.randint(18, 45, data_size)
p2_e = np.random.randint(0, 15, data_size)

X = np.column_stack([p1_h, p1_w, p1_a, p1_e, p2_h, p2_w, p2_a, p2_e])

# Synthetic rule: calculate a hidden "power index" for each player
def power_index(h, w, a, e):
    return (h * 0.3) + (w * 0.4) + (e * 2.0) - (a * 0.5)

p1_power = power_index(p1_h, p1_w, p1_a, p1_e) + np.random.normal(0, 5, data_size)
p2_power = power_index(p2_h, p2_w, p2_a, p2_e) + np.random.normal(0, 5, data_size)

# 1 if Player 1 wins, 0 if Player 2 wins
y = (p1_power > p2_power).astype(int)

# -------- Feature Scaling --------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

joblib.dump(scaler, "scaler.save")

# -------- Deep Learning Model --------
model = keras.Sequential([
    keras.layers.Dense(64, activation="relu", input_shape=(8,)),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(32, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dense(1, activation="sigmoid") # Outputs probability of Player 1 winning
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.fit(X_scaled, y, epochs=50, batch_size=32, validation_split=0.2)

model.save("match_predictor_model.h5")

print("✅ Complete Match Predictor Model trained & scaler saved!")