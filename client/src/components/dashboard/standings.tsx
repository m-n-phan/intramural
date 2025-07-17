import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Award, Medal } from "lucide-react";
import type { Sport, Team } from "@shared/schema";

// Function to determine the current season based on month and year
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January, 11 = December)
  const year = now.getFullYear();
  
  // Academic year typically runs from August to July
  // Fall: August, September, October, November
  // Winter: December, January, February
  // Spring: March, April
  // Summer: May, June, July
  
  if (month >= 7 && month <= 10) { // August to November
    return `Fall ${year}`;
  } else if (month >= 11 || month <= 1) { // December to February
    // Winter spans across calendar years
    const academicYear = month >= 11 ? year + 1 : year;
    return `Winter ${academicYear}`;
  } else if (month >= 2 && month <= 3) { // March to April
    return `Spring ${year}`;
  } else { // May to July
    return `Summer ${year}`;
  }
};

export function Standings() {
  const { data: sports, isLoading: sportsLoading } = useQuery<Sport[]>({
    queryKey: ['/api/sports'],
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const getTeamsBySport = (sportId: number) => {
    return teams?.filter((team) => team.sportId === sportId)
      .sort((a, b) => {
        // Sort by points first, then by wins, then by win percentage
        if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0);
        if ((b.wins ?? 0) !== (a.wins ?? 0)) return (b.wins ?? 0) - (a.wins ?? 0);
        const aWinPct = getWinPercentage(a.wins ?? 0, a.losses ?? 0);
        const bWinPct = getWinPercentage(b.wins ?? 0, b.losses ?? 0);
        return bWinPct - aWinPct;
      }) || [];
  };

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return (wins / total);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-orange-500" />;
      default:
        return <span className="text-muted-foreground font-medium">{rank}</span>;
    }
  };

  if (sportsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Standings</h2>
        <p className="text-muted-foreground">
          Current standings and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sports?.map((sport) => {
          const sportTeams = getTeamsBySport(sport.id);
          
          return (
            <Card key={sport.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  {sport.name} - {getCurrentSeason()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sportTeams.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Team</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Record</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Win%</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sportTeams.map((team, index: number) => (
                          <tr key={team.id} className="border-b">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                {getRankIcon(index + 1)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                                  <Trophy className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{team.name}</div>
                                  <div className="text-sm text-muted-foreground capitalize">
                                    {team.division}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-foreground">
                                {team.wins}-{team.losses}
                                {(team.draws ?? 0) > 0 && `-${team.draws}`}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-foreground">
                                {getWinPercentage(team.wins ?? 0, team.losses ?? 0).toFixed(3)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-foreground font-medium">{team.points}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No teams in this sport yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!sports || !Array.isArray(sports) || sports.length === 0) && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Sports Available</h3>
          <p className="text-muted-foreground">
            Add sports to see standings and team rankings
          </p>
        </div>
      )}
    </div>
  );
}
