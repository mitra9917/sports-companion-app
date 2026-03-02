# train_match_model.py
import numpy as np
import pandas as pd
from tensorflow import keras
from sklearn.preprocessing import StandardScaler
import joblib

# -------- Synthetic Training Data --------
np.random.seed(42)

data_size = 500
height = np.random.randint(150, 190, data_size)
weight = np.random.randint(45, 90, data_size)
age = np.random.randint(18, 40, data_size)
experience = np.random.randint(0, 10, data_size)

X = np.column_stack([height, weight, age, experience])

# Simple rule: more experience + better physique => dominant
y = (0.3*height + 0.3*weight + 0.2*experience - 0.1*age) > 100
y = y.astype(int)

# -------- Feature Scaling --------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

joblib.dump(scaler, "scaler.save")

# -------- Deep Learning Model --------
model = keras.Sequential([
    keras.layers.Dense(32, activation="relu", input_shape=(4,)),
    keras.layers.BatchNormalization(),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(1, activation="sigmoid")
])

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.fit(X_scaled, y, epochs=30, batch_size=32, validation_split=0.2)

model.save("match_predictor_model.h5")

print("✅ Hybrid DL Model trained & scaler saved!")