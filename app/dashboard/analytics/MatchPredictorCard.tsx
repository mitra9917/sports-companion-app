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

  const [result, setResult] = useState<any>(null);

  const handlePredict = async () => {
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

      <button
        onClick={handlePredict}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Predict Match
      </button>

      {result && (
        <div className="mt-4 p-4 bg-white rounded text-black">
          <p><strong>Result:</strong> {result.fairness}</p>
          <p>
            <strong>Dominant:</strong> {result.dominance.player} (
            {result.dominance.probability}%)
          </p>
        </div>
      )}
    </div>
  );
}