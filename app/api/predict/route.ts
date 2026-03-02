import { NextResponse } from "next/server";

// simple fast heuristic fallback
function fastPredict(player1: any, player2: any) {
  const score1 =
    player1.height * 0.2 +
    player1.weight * 0.2 +
    player1.experience * 0.4 +
    (100 - player1.age) * 0.2;

  const score2 =
    player2.height * 0.2 +
    player2.weight * 0.2 +
    player2.experience * 0.4 +
    (100 - player2.age) * 0.2;

  const fairness = Math.abs(score1 - score2) < 10 ? "Fair Match" : "Unbalanced Match";

  const dominant =
    score1 > score2
      ? { player: "Player 1", probability: (score1 / (score1 + score2)) * 100 }
      : { player: "Player 2", probability: (score2 / (score1 + score2)) * 100 };

  return {
    fairness,
    dominance: {
      player: dominant.player,
      probability: dominant.probability.toFixed(2),
    },
    mode: "fast",
  };
}

// app/api/predict/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("ML API error:", err);
    return Response.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}