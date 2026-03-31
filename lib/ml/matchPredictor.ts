export type PlayerStats = {
  height: number;
  weight: number;
  age: number;
  experience: number;
};

// We change this to an 'async' function because it now makes a network request to Python
export async function predictMatchFairness(p1: PlayerStats, p2: PlayerStats) {
  try {
    // 1. Try to ask the Python AI Backend
    const response = await fetch('http://127.0.0.1:5000/predict_compatibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player1: p1,
        player2: p2,
        useDeepModel: true // Tells Python to use the .h5 model
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error("Python API failed to process the request.");
    }

    // Return the data exactly as your Next.js UI expects it
    return {
      fairness: data.fairness,
      dominance: {
        player: data.dominance.player,
        probability: data.dominance.probability, // FastAPI already rounded this for us
      },
      mode: data.mode // 'hybrid-ai' or 'quick-heuristic'
    };

  } catch (error) {
    // 2. THE FALLBACK: If the Python server is off, use your original math
    console.warn("Python backend unreachable. Falling back to local offline calculation.", error);

    const score1 =
      p1.height * 0.2 +
      p1.weight * 0.2 +
      p1.experience * 0.4 +
      (100 - p1.age) * 0.2;

    const score2 =
      p2.height * 0.2 +
      p2.weight * 0.2 +
      p2.experience * 0.4 +
      (100 - p2.age) * 0.2;

    const diff = Math.abs(score1 - score2);
    const fairness = diff < 10 ? "Fair Match" : "Unbalanced Match";

    const dominance =
      score1 > score2
        ? { player: "Player 1", probability: (score1 / (score1 + score2)) * 100 }
        : { player: "Player 2", probability: (score2 / (score1 + score2)) * 100 };

    return {
      fairness,
      dominance: {
        player: dominance.player,
        probability: dominance.probability.toFixed(2),
      },
      mode: "offline-fallback" // Tells the UI it used the local math
    };
  }
}