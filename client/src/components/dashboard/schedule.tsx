import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Calendar, ChevronLeft, ChevronRight, MoreVertical, Clock, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect } from "react";

export function Schedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const { data: games, isLoading } = useQuery({
    queryKey: ['/api/games'],
  });

  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const form = useForm({
    resolver: zodResolver(insertGameSchema),
    defaultValues: {
      sportId: 0,
      homeTeamId: 0,
      awayTeamId: 0,
      gender: "co-ed",
      scheduledAt: "",
      venue: "",
      status: "scheduled",
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertGameSchema.partial()),
    defaultValues: {
      sportId: 0,
      homeTeamId: 0,
      awayTeamId: 0,
      gender: "co-ed",
      scheduledAt: "",
      venue: "",
      status: "scheduled",
    },
  });

  // Function to get eligible teams based on selected sport, gender, and division
  const getEligibleTeams = (selectedSportId: number, selectedGender: string, selectedDivision?: string) => {
    if (!teams || !selectedSportId || !selectedGender) return [];
    
    return teams.filter((team: any) => 
      team.sportId === selectedSportId && 
      team.gender === selectedGender &&
      (!selectedDivision || team.division === selectedDivision)
    );
  };

  // Function to get eligible away teams (excluding home team)
  const getEligibleAwayTeams = (selectedSportId: number, selectedGender: string, homeTeamId: number, selectedDivision?: string) => {
    const eligibleTeams = getEligibleTeams(selectedSportId, selectedGender, selectedDivision);
    return eligibleTeams.filter((team: any) => team.id !== homeTeamId);
  };

  // Watch form values for team filtering
  const watchedSportId = form.watch("sportId");
  const watchedGender = form.watch("gender");
  const watchedHomeTeamId = form.watch("homeTeamId");
  
  // Watch edit form values for team filtering
  const watchedEditSportId = editForm.watch("sportId");
  const watchedEditGender = editForm.watch("gender");
  const watchedEditHomeTeamId = editForm.watch("homeTeamId");
  
  // Get home team to determine division for filtering
  const selectedHomeTeam = teams?.find((team: any) => team.id === watchedHomeTeamId);
  const selectedDivision = selectedHomeTeam?.division;
  
  // Get edit home team to determine division for filtering
  const selectedEditHomeTeam = teams?.find((team: any) => team.id === watchedEditHomeTeamId);
  const selectedEditDivision = selectedEditHomeTeam?.division;

  // Clear away team when home team changes to ensure proper filtering
  useEffect(() => {
    if (watchedHomeTeamId && form.getValues("awayTeamId")) {
      const awayTeam = teams?.find((team: any) => team.id === form.getValues("awayTeamId"));
      if (awayTeam && (awayTeam.division !== selectedDivision || awayTeam.gender !== watchedGender)) {
        form.setValue("awayTeamId", 0);
      }
    }
  }, [watchedHomeTeamId, watchedGender, selectedDivision, teams, form]);

  // Clear away team when home team changes in edit form
  useEffect(() => {
    if (watchedEditHomeTeamId && editForm.getValues("awayTeamId")) {
      const awayTeam = teams?.find((team: any) => team.id === editForm.getValues("awayTeamId"));
      if (awayTeam && (awayTeam.division !== selectedEditDivision || awayTeam.gender !== watchedEditGender)) {
        editForm.setValue("awayTeamId", 0);
      }
    }
  }, [watchedEditHomeTeamId, watchedEditGender, selectedEditDivision, teams, editForm]);

  const createGameMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/games", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setShowAddDialog(false);
      form.reset();
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
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
    mutationFn: async (data: { id: number; updates: any }) => {
      return await apiRequest("PUT", `/api/games/${data.id}`, data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setShowEditDialog(false);
      setSelectedGame(null);
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update game",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form data:', data);
    
    // Validate required fields
    if (!data.sportId || data.sportId === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a sport",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.homeTeamId || data.homeTeamId === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a home team",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.awayTeamId || data.awayTeamId === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select an away team",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure all numeric fields are properly converted
    const submitData = {
      ...data,
      sportId: Number(data.sportId),
      homeTeamId: Number(data.homeTeamId),
      awayTeamId: Number(data.awayTeamId),
      scheduledAt: data.scheduledAt, // String will be transformed to Date by Zod schema
    };
    
    console.log('Submit data:', submitData);
    createGameMutation.mutate(submitData);
  };

  const onEditSubmit = (data: any) => {
    if (!selectedGame) return;
    
    const submitData = {
      ...data,
      sportId: Number(data.sportId),
      homeTeamId: Number(data.homeTeamId),
      awayTeamId: Number(data.awayTeamId),
      scheduledAt: data.scheduledAt,
    };
    updateGameMutation.mutate({ id: selectedGame.id, updates: submitData });
  };

  const handlePreviousMonth = () => {
    const minDate = new Date(2025, 6, 1); // July 1, 2025
    
    if (viewMode === 'week') {
      const newDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (newDate >= minDate) {
        setCurrentDate(newDate);
      }
    } else {
      const newDate = subMonths(currentDate, 1);
      if (newDate >= minDate) {
        setCurrentDate(newDate);
      }
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
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

  const handleEditGame = (game: any) => {
    setSelectedGame(game);
    
    // Format the date for datetime-local input
    const formattedDate = format(new Date(game.scheduledAt), "yyyy-MM-dd'T'HH:mm");
    
    // Populate the edit form with current game data
    editForm.reset({
      sportId: game.sportId,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      gender: game.gender,
      scheduledAt: formattedDate,
      venue: game.venue,
      status: game.status,
    });
    
    setShowEditDialog(true);
  };

  const handleDeleteGame = (game: any) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      deleteGameMutation.mutate(game.id);
    }
  };

  const getDateRange = () => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate)
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
    }
  };

  const getFilteredGames = (games: any[]) => {
    if (!games) return [];
    
    const { start, end } = getDateRange();
    return games.filter(game => {
      const gameDate = new Date(game.scheduledAt);
      return isWithinInterval(gameDate, { start, end });
    });
  };

  const groupGamesByDate = (games: any[]) => {
    const filteredGames = getFilteredGames(games);
    const grouped = filteredGames.reduce((acc: any, game: any) => {
      const date = format(new Date(game.scheduledAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(game);
      return acc;
    }, {});
    return grouped || {};
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'live':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const groupedGames = groupGamesByDate(games);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 mb-4" />
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Schedule</h2>
          <p className="text-muted-foreground">
            View and manage game schedules
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Game
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Game</DialogTitle>
              <DialogDescription>
                Create a new game by selecting teams, date, and venue.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports?.map((sport: any) => (
                            <SelectItem key={sport.id} value={sport.id.toString()}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="men">Men's</SelectItem>
                          <SelectItem value="women">Women's</SelectItem>
                          <SelectItem value="co-ed">Co-ed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedHomeTeam && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Division:</strong> {selectedHomeTeam.division}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Away team must be from the same division
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="homeTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Team</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select home team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getEligibleTeams(watchedSportId, watchedGender).map((team: any) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name} ({team.division})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="awayTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Away Team</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select away team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getEligibleAwayTeams(watchedSportId, watchedGender, watchedHomeTeamId, selectedDivision).length > 0 ? (
                              getEligibleAwayTeams(watchedSportId, watchedGender, watchedHomeTeamId, selectedDivision).map((team: any) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name} ({team.division})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0" disabled>
                                No eligible teams available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {getEligibleAwayTeams(watchedSportId, watchedGender, watchedHomeTeamId, selectedDivision).length === 0 && watchedHomeTeamId > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Only teams from the same division and gender category can play against each other.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Court 1, Gym 2, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGameMutation.isPending}>
                    {createGameMutation.isPending ? "Scheduling..." : "Schedule Game"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Game Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Game</DialogTitle>
              <DialogDescription>
                Update the game details below.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="sportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports?.map((sport: any) => (
                            <SelectItem key={sport.id} value={sport.id.toString()}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="men">Men's</SelectItem>
                          <SelectItem value="women">Women's</SelectItem>
                          <SelectItem value="co-ed">Co-ed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedEditHomeTeam && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Division:</strong> {selectedEditHomeTeam.division}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Away team must be from the same division
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="homeTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Team</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select home team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getEligibleTeams(watchedEditSportId, watchedEditGender).map((team: any) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name} ({team.division})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="awayTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Away Team</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select away team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getEligibleAwayTeams(watchedEditSportId, watchedEditGender, watchedEditHomeTeamId, selectedEditDivision).length > 0 ? (
                              getEligibleAwayTeams(watchedEditSportId, watchedEditGender, watchedEditHomeTeamId, selectedEditDivision).map((team: any) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name} ({team.division})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0" disabled>
                                No eligible teams available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {getEligibleAwayTeams(watchedEditSportId, watchedEditGender, watchedEditHomeTeamId, selectedEditDivision).length === 0 && watchedEditHomeTeamId > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Only teams from the same division and gender category can play against each other.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Court 1, Gym 2, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateGameMutation.isPending}>
                    {updateGameMutation.isPending ? "Updating..." : "Update Game"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{getDisplayTitle()}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedGames).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedGames).map(([date, dateGames]) => (
                <div key={date}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                  </h4>
                  <div className="space-y-3">
                    {(dateGames as any[]).map((game: any) => (
                      <div key={game.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-foreground">
                              {format(new Date(game.scheduledAt), 'h:mm')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(game.scheduledAt), 'a')}
                            </div>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {teams?.find((t: any) => t.id === game.homeTeamId)?.name || 'Home Team'} vs {teams?.find((t: any) => t.id === game.awayTeamId)?.name || 'Away Team'}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                <span>{game.venue}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {game.gender === 'men' ? "Men's" : game.gender === 'women' ? "Women's" : "Co-ed"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(game.status)}>
                            {game.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditGame(game)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Game
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteGame(game)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Game
                              </DropdownMenuItem>
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
              <p className="text-muted-foreground mb-4">
                Get started by scheduling your first game
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Game
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
