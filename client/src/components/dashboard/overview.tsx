import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Users, Gamepad2, TrendingUp, DollarSign, Trophy } from "lucide-react";
import type { Game } from "@shared/schema";
import type { AnalyticsOverview } from "./analytics";

export function Overview() {
  const { data: analytics, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: recentGames } = useQuery<Game[]>({
    queryKey: ['/api/games/recent'],
  });

  const { data: upcomingGames } = useQuery<Game[]>({
    queryKey: ['/api/games/upcoming'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Teams",
      value: analytics?.activeTeams || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Games Played",
      value: "1,247",
      icon: Gamepad2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Participation Rate",
      value: "68%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      title: "Revenue",
      value: `$${analytics?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your intramural program.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGames && recentGames.length > 0 ? (
                recentGames.slice(0, 3).map((game) => (
                  <div key={game.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Game #{game.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {game.venue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {game.homeScore}-{game.awayScore}
                      </p>
                      <Badge variant="secondary">Final</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No recent games</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Upcoming Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(upcomingGames?.length ?? 0) > 0 ? (
                (upcomingGames as Game[]).slice(0, 3).map((game) => (
                  <div key={game.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Game #{game.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {game.venue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {new Date(game.scheduledAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.scheduledAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No upcoming games</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
