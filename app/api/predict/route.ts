import { NextResponse } from "next/server";

type PlayerStats = {
  height: number;
  weight: number;
  age: number;
  experience: number;
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

function fastPredict(player1: PlayerStats, player2: PlayerStats): PredictionResult {
  // Calculate relative advantages 
  // Height and weight give minor advantages
  const heightAdv = (player1.height - player2.height) * 0.2;
  const weightAdv = (player1.weight - player2.weight) * 0.1;
  // Experience is a major factor
  const expAdv = (player1.experience - player2.experience) * 3.0;
  // Being younger gives a minor stamina/speed advantage
  const ageAdv = (player2.age - player1.age) * 0.5;

  // Total advantage points for Player 1
  const totalAdv = heightAdv + weightAdv + expAdv + ageAdv;
  
  // Clamp advantage to max +/- 45 to keep probability between 5% and 95%
  const clampedAdv = Math.max(-45, Math.min(45, totalAdv));
  
  let p1Prob = 50 + clampedAdv;
  
  const fairness = Math.abs(clampedAdv) < 15 ? "Fair Match" : "Unbalanced Match";

  const dominant = p1Prob >= 50
    ? { player: "Player 1", probability: p1Prob }
    : { player: "Player 2", probability: 100 - p1Prob };

  return {
    fairness,
    dominance: {
      player: dominant.player,
      probability: Number(dominant.probability.toFixed(2)),
    },
    mode: "fast",
  };
}

function getMlUrl() {
  if (process.env.ML_URL) {
    return process.env.ML_URL;
  }

  if (process.env.NEXT_PUBLIC_ML_URL) {
    return process.env.NEXT_PUBLIC_ML_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:8000";
  }

  return null;
}

function getMlTimeoutMs() {
  const rawTimeout =
    process.env.ML_TIMEOUT_MS || process.env.NEXT_PUBLIC_ML_TIMEOUT_MS;
  const parsedTimeout = rawTimeout ? Number(rawTimeout) : NaN;

  if (Number.isFinite(parsedTimeout) && parsedTimeout >= 1000) {
    return parsedTimeout;
  }

  return process.env.NODE_ENV === "production" ? 10000 : 12000;
}

function withFallback(
  player1: PlayerStats,
  player2: PlayerStats,
  warning: string
): PredictionResult {
  return {
    ...fastPredict(player1, player2),
    mode: "fast-fallback",
    warning,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const player1 = body.player1 as PlayerStats;
    const player2 = body.player2 as PlayerStats;
    const useDeepModel = body.useDeepModel === true;

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: "Both players are required" },
        { status: 400 }
      );
    }

    // The fast heuristic should never wait on the remote ML service.
    if (!useDeepModel) {
      return NextResponse.json(fastPredict(player1, player2));
    }

    const mlUrl = getMlUrl();

    if (!mlUrl) {
      return NextResponse.json(
        withFallback(
          player1,
          player2,
          "Deep model is not configured in production, so the fast predictor was used."
        )
      );
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), getMlTimeoutMs());
      let res: Response;

      try {
        res = await fetch(`${mlUrl}/predict_compatibility`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) {
        throw new Error(`ML API returned status: ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    } catch (mlError) {
      console.warn("ML API fetch error:", mlError);
      const warning =
        mlError instanceof Error && mlError.name === "AbortError"
          ? "Deep model timed out, so the fast predictor was used."
          : "Deep model is currently unavailable or slow, so the fast predictor was used.";

      return NextResponse.json(
        withFallback(
          player1,
          player2,
          warning
        )
      );
    }
  } catch (err) {
    console.error("General API error:", err);
    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}
