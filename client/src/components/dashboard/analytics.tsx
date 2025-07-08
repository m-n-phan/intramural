import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Trophy, DollarSign, Activity } from "lucide-react";

export function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
  });

  const { data: games } = useQuery({
    queryKey: ['/api/games'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const participationBySport = sports?.map((sport: any) => {
    const sportTeams = teams?.filter((team: any) => team.sportId === sport.id) || [];
    const totalPlayers = sportTeams.length * 8; // Estimate 8 players per team
    return {
      name: sport.name,
      teams: sportTeams.length,
      players: totalPlayers,
      percentage: sports?.length > 0 ? (sportTeams.length / (teams?.length || 1)) * 100 : 0
    };
  }) || [];

  const monthlyStats = [
    { month: 'Jan', games: 45, participation: 320 },
    { month: 'Feb', games: 52, participation: 380 },
    { month: 'Mar', games: 67, participation: 425 },
    { month: 'Apr', games: 73, participation: 480 },
    { month: 'May', games: 68, participation: 520 },
    { month: 'Jun', games: 58, participation: 490 },
  ];

  const completedGames = games?.filter((game: any) => game.status === 'completed').length || 0;
  const scheduledGames = games?.filter((game: any) => game.status === 'scheduled').length || 0;
  const totalGames = games?.length || 0;
  const gameCompletionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Track program performance and engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Sports</p>
                <p className="text-2xl font-bold text-foreground">{sports?.length || 0}</p>
                <p className="text-xs text-green-600 mt-1">+2 from last season</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Teams</p>
                <p className="text-2xl font-bold text-foreground">{teams?.length || 0}</p>
                <p className="text-xs text-green-600 mt-1">+15% from last season</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Game Completion</p>
                <p className="text-2xl font-bold text-foreground">{gameCompletionRate.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 mt-1">{completedGames} of {totalGames} games</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Revenue/Team</p>
                <p className="text-2xl font-bold text-foreground">$75</p>
                <p className="text-xs text-green-600 mt-1">Standard team fee</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Participation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2 p-4">
              {monthlyStats.map((stat, index) => (
                <div key={stat.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-primary/20 rounded-t-sm mb-2 min-h-[20px]"
                    style={{ height: `${(stat.participation / 600) * 200}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{stat.month}</span>
                  <span className="text-xs text-foreground font-medium">{stat.participation}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Monthly participant count over the past 6 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Sport Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participationBySport.slice(0, 5).map((sport, index) => (
                <div key={sport.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sport.name}</p>
                      <p className="text-sm text-muted-foreground">{sport.teams} teams</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(sport.percentage, 5)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {sport.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {participationBySport.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No sports data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-foreground">{completedGames}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium text-foreground">{scheduledGames}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-medium text-foreground">
                  {games?.filter((game: any) => game.status === 'cancelled').length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams?.slice(0, 3).map((team: any, index: number) => (
                <div key={team.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{team.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {team.wins}-{team.losses}
                  </span>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">No teams available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg per Sport</span>
                <span className="font-medium text-foreground">
                  ${sports?.length > 0 ? ((analytics?.totalRevenue || 0) / sports.length).toFixed(0) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Collection Rate</span>
                <span className="font-medium text-foreground">
                  {analytics?.paidTeams && teams?.length 
                    ? ((analytics.paidTeams / teams.length) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Amount</span>
                <span className="font-medium text-foreground">${analytics?.pendingRevenue || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
