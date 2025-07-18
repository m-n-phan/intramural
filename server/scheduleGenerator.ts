import type { Team } from "@shared/schema";

export interface Matchup {
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * Generates a round-robin schedule for a given list of teams.
 * This ensures each team plays every other team once.
 * @param teams - An array of team objects.
 * @returns An array of matchups.
 */
export function generateRoundRobinSchedule(teams: Team[]): Matchup[] {
  const schedule: Matchup[] = [];
  if (teams.length < 2) {
    return schedule;
  }

  // If there's an odd number of teams, add a "bye" team to make scheduling even.
  const localTeams = [...teams];
  if (localTeams.length % 2 !== 0) {
    localTeams.push({ id: -1, name: "BYE" } as any); // A dummy team for scheduling purposes.
  }

  const numTeams = localTeams.length;
  const numRounds = numTeams - 1;
  const half = numTeams / 2;

  const teamIndices = localTeams.map((_, i) => i);

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const homeIndex = teamIndices[i];
      const awayIndex = teamIndices[numTeams - 1 - i];
      
      const homeTeam = localTeams[homeIndex];
      const awayTeam = localTeams[awayIndex];

      // We don't create a game for a "bye" week.
      if (homeTeam.id === -1 || awayTeam.id === -1) {
        continue;
      }

      // To ensure fairness, alternate which team is home vs. away.
      if (i % 2 === 1) {
        schedule.push({ homeTeam: awayTeam, awayTeam: homeTeam });
      } else {
        schedule.push({ homeTeam: homeTeam, awayTeam: awayTeam });
      }
    }

    // Rotate the team list to generate new matchups for the next round.
    // The first team stays in place, while the rest rotate around it.
    const lastTeamIndex = teamIndices.pop()!;
    teamIndices.splice(1, 0, lastTeamIndex);
  }

  return schedule;
} 