"use client";
import { useState } from "react";

export default function MatchPredictorCard() {
  const [player1, setPlayer1] = useState({
    height: "",
    weight: "",
    age: "",
    experience: "",
  });

  const [player2, setPlayer2] = useState({
    height: "",
    weight: "",
    age: "",
    experience: "",
  });

  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async() => {
    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1: {
            height: Number(player1.height),
            weight: Number(player1.weight),
            age: Number(player1.age),
            experience: Number(player1.experience),
          },
          player2: {
            height: Number(player2.height),
            weight: Number(player2.weight),
            age: Number(player2.age),
            experience: Number(player2.experience),
          },
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Prediction error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 mt-10 border rounded-xl shadow bg-black/40">
      <h2 className="text-xl font-bold mb-4 text-white">
        🤖 Match Fairness Predictor
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {[player1, player2].map((player, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="font-semibold text-white">Player {idx + 1}</h3>
            {["height", "weight", "age", "experience"].map((field) => (
              <input
                key={field}
                type="number"
                placeholder={field}
                className="border p-2 w-full rounded bg-gray-900 text-white border-gray-700"
                value={(player as any)[field]}
                onChange={(e) =>
                  idx === 0
                    ? setPlayer1({ ...player1, [field]: e.target.value })
                    : setPlayer2({ ...player2, [field]: e.target.value })
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => handlePredict(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          🧠 Advanced AI Analysis
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mt-4 text-gray-300">Analyzing match...</p>
      )}

      {/* Result */}
      {result && result.dominance && (
  <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
    <p className="text-sm text-white/80">
      <strong>Result:</strong> {result.fairness ?? "Unknown"}
    </p>

    <p className="text-sm text-white/80">
      <strong>Dominant:</strong> {result.dominance?.player ?? "N/A"} (
      {result.dominance?.probability ?? 0}%)
    </p>

    {/* Progress Bar */}
    <div className="mt-3 h-2 w-full rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
        style={{ width: `${result.dominance?.probability ?? 0}%` }}
      />
    </div>

    <p className="mt-1 text-xs text-white/60">
      Mode: Hybrid AI Model
    </p>
  </div>
)}
    </div>
  );
}