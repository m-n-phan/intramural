import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Calendar, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import type { Game, Team, Sport, InsertGame } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GameForm } from "./GameForm";

export function Schedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: sports } = useQuery<Sport[]>({
    queryKey: ['/api/sports'],
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: Partial<InsertGame>) => {
      return await apiRequest("POST", "/api/games", data);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Game scheduled successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setShowAddDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Scheduling Error",
        description: error.message || "Failed to schedule game",
        variant: "destructive",
      });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      return await apiRequest("DELETE", `/api/games/${gameId}`);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete game",
        variant: "destructive",
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<InsertGame> }) => {
      return await apiRequest("PUT", `/api/games/${data.id}`, data.updates);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setShowEditDialog(false);
      setSelectedGame(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update game",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Partial<InsertGame>) => {
    if (!data.sportId || data.sportId === 0 || !data.homeTeamId || data.homeTeamId === 0 || !data.awayTeamId || data.awayTeamId === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill out all team and sport fields.",
        variant: "destructive",
      });
      return;
    }
    createGameMutation.mutate(data);
  };

  const onEditSubmit = (data: Partial<InsertGame>) => {
    if (!selectedGame) return;
    updateGameMutation.mutate({ id: selectedGame.id, updates: data });
  };

  const handlePreviousMonth = () => {
    const newDate = viewMode === 'week' ? new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) : subMonths(currentDate, 1);
    if (newDate >= new Date(2025, 6, 1)) {
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(viewMode === 'week' ? new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) : addMonths(currentDate, 1));
  };

  const getDisplayTitle = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setShowEditDialog(true);
  };

  const handleDeleteGame = (game: Game) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      deleteGameMutation.mutate(game.id);
    }
  };

  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    } else {
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  }, [viewMode, currentDate]);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter(game => {
      const gameDate = new Date(game.scheduledAt);
      return isWithinInterval(gameDate, dateRange);
    });
  }, [games, dateRange]);

  const groupedGames = useMemo(() => {
    return filteredGames.reduce((acc: { [key: string]: Game[] }, game) => {
      const date = format(new Date(game.scheduledAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(game);
      return acc;
    }, {});
  }, [filteredGames]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Schedule</h2>
          <p className="text-muted-foreground">View and manage game schedules</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Schedule Game</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Game</DialogTitle>
              <DialogDescription>Create a new game by selecting teams, date, and venue.</DialogDescription>
            </DialogHeader>
            <GameForm 
              onSubmit={onSubmit} 
              isPending={createGameMutation.isPending} 
              sports={sports} 
              teams={teams} 
              onCancel={() => setShowAddDialog(false)}
              submitButtonText="Schedule Game"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Game</DialogTitle>
              <DialogDescription>Update the game details below.</DialogDescription>
            </DialogHeader>
            <GameForm 
              onSubmit={onEditSubmit} 
              isPending={updateGameMutation.isPending} 
              sports={sports} 
              teams={teams} 
              initialValues={selectedGame ? { ...selectedGame, scheduledAt: new Date(selectedGame.scheduledAt) } : undefined}
              onCancel={() => setShowEditDialog(false)}
              submitButtonText="Update Game"
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <CardTitle>{getDisplayTitle()}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')}>Week</Button>
              <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('month')}>Month</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedGames).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedGames).map(([date, dateGames]) => (
                <div key={date}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">{format(new Date(date), 'EEEE, MMMM dd, yyyy')}</h4>
                  <div className="space-y-3">
                    {(dateGames).map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-foreground">{format(new Date(game.scheduledAt), 'h:mm')}</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(game.scheduledAt), 'a')}</div>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><Calendar className="h-4 w-4 text-primary" /></div>
                            <div>
                              <div className="font-medium text-foreground">
                                {(teams?.find((t) => t.id === game.homeTeamId)?.name) || 'Home Team'} vs {(teams?.find((t) => t.id === game.awayTeamId)?.name) || 'Away Team'}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                <span>{game.venue ?? ''}</span>
                                <Badge variant="secondary" className="text-xs">{game.gender === 'men' ? "Men's" : game.gender === 'women' ? "Women's" : "Co-ed"}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(game.status)}>{game.status}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditGame(game)}><Edit className="h-4 w-4 mr-2" />Edit Game</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteGame(game)} className="text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete Game</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Games Scheduled</h3>
              <p className="text-muted-foreground mb-4">Get started by scheduling your first game</p>
              <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Schedule Game</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
