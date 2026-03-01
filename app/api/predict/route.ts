import { NextResponse } from "next/server";
import { predictMatchFairness } from "@/lib/ml/matchPredictor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player1, player2 } = body;

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: "Both player stats are required" },
        { status: 400 }
      );
    }

    const result = predictMatchFairness(player1, player2);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}