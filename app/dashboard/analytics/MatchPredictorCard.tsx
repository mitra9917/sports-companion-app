"use client";

import { useState } from "react";

type PlayerFormState = {
  height: string;
  weight: string;
  age: string;
  experience: string;
};

type PredictionResult = {
  fairness: string;
  dominance: {
    player: string;
    probability: number;
  };
  mode: string;
  warning?: string;
};

const initialPlayerState: PlayerFormState = {
  height: "",
  weight: "",
  age: "",
  experience: "",
};

export default function MatchPredictorCard() {
  const [player1, setPlayer1] = useState<PlayerFormState>(initialPlayerState);
  const [player2, setPlayer2] = useState<PlayerFormState>(initialPlayerState);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMode, setLoadingMode] = useState<"fast" | "deep" | null>(null);

  const hasEmptyFields = [...Object.values(player1), ...Object.values(player2)].some(
    (value) => value.trim() === ""
  );

  const handlePredict = async (useDeepModel = false) => {
    setLoadingMode(useDeepModel ? "deep" : "fast");
    setError(null);
    setResult(null);

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
          useDeepModel,
        }),
      });

      const data = (await res.json()) as PredictionResult | { error?: string };
      const apiError = "error" in data ? data.error : undefined;

      if (!res.ok) {
        throw new Error(apiError || "Prediction failed");
      }

      setResult(data as PredictionResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Prediction failed. Please try again.";
      setError(message);
    } finally {
      setLoadingMode(null);
    }
  };

  const updatePlayerField = (
    playerIndex: 1 | 2,
    field: keyof PlayerFormState,
    value: string
  ) => {
    if (playerIndex === 1) {
      setPlayer1((current) => ({ ...current, [field]: value }));
      return;
    }

    setPlayer2((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="mt-10 rounded-xl border border-white/10 bg-black/40 p-6 shadow">
      <h2 className="mb-2 text-xl font-bold text-white">Match Fairness Predictor</h2>
      <p className="text-sm text-white/65">
        Quick analysis returns instantly. AI analysis uses the remote model and falls back automatically if it is unavailable.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {[player1, player2].map((player, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="font-semibold text-white">Player {idx + 1}</h3>
            {(["height", "weight", "age", "experience"] as const).map((field) => (
              <input
                key={field}
                type="number"
                inputMode="numeric"
                min="0"
                placeholder={field}
                className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white"
                value={player[field]}
                onChange={(e) => updatePlayerField(idx === 0 ? 1 : 2, field, e.target.value)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handlePredict(false)}
          disabled={loadingMode !== null || hasEmptyFields}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingMode === "fast" ? "Analyzing..." : "Quick Analysis"}
        </button>
        <button
          onClick={() => handlePredict(true)}
          disabled={loadingMode !== null || hasEmptyFields}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingMode === "deep" ? "Running AI..." : "Advanced AI Analysis"}
        </button>
      </div>

      {hasEmptyFields && (
        <p className="mt-3 text-xs text-white/55">Fill all player fields to run the predictor.</p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/80">
            <strong>Result:</strong> {result.fairness}
          </p>

          <p className="mt-1 text-sm text-white/80">
            <strong>Dominant:</strong> {result.dominance.player} ({result.dominance.probability}%)
          </p>

          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${result.dominance.probability}%` }}
            />
          </div>

          <p className="mt-2 text-xs uppercase tracking-wide text-white/55">Mode: {result.mode}</p>

          {result.warning && (
            <div className="mt-3 rounded-lg border border-amber-400/25 bg-amber-300/10 p-3 text-xs text-amber-100">
              {result.warning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
