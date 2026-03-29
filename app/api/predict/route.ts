import { NextResponse } from "next/server";

function fastPredict(player1: any, player2: any) {
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
      probability: dominant.probability.toFixed(2),
    },
    mode: "fast",
  };
}

// app/api/predict/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mlUrl = process.env.NEXT_PUBLIC_ML_URL || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${mlUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`ML API returned status: ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    } catch (mlError) {
      console.warn("ML API fetch error:", mlError);
      
      if (body.useDeepModel) {
        return NextResponse.json(
          { error: "Deep Learning ML Server is offline! To use deep AI, please open a terminal and run: npm run start:ml" },
          { status: 503 }
        );
      }
      
      console.warn("Falling back to local heuristic.");
      const fallbackResult = fastPredict(body.player1, body.player2);
      return NextResponse.json(fallbackResult);
    }
  } catch (err) {
    console.error("General API error:", err);
    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}