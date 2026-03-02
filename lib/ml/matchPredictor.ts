export type PlayerStats = {
  height: number;
  weight: number;
  age: number;
  experience: number;
};

export function predictMatchFairness(p1: PlayerStats, p2: PlayerStats) {
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
  };
}