import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trophy, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Sport, InsertSport } from "@shared/schema";
import { insertSportSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

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

export function Sports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: sports, isLoading } = useQuery<Sport[]>({
    queryKey: ['/api/sports'],
  });

  const form = useForm<InsertSport>({
    resolver: zodResolver(insertSportSchema),
    defaultValues: {
      name: "",
      description: "",
      gender: "co-ed",
      maxTeams: 16,
      maxPlayersPerTeam: 12,
      minPlayersPerTeam: 6,
      teamFee: "75.00",
      status: "active",
    },
  });

  const createSportMutation = useMutation<Sport, Error, InsertSport>({
    mutationFn: async (data) => {
      const response = await fetch("/api/sports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create sport");
      }
      return (await response.json()) as Sport;
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Sport created successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/sports'] });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sport",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSport) => {
    createSportMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-8 bg-muted rounded w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded" />
                  </div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sports & Seasons</h2>
          <p className="text-muted-foreground">
            Manage your sports offerings and seasonal schedules
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sport</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Basketball" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Sport description..." {...field} value={field.value ?? ''} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="men">Men&apos;s</SelectItem>
                          <SelectItem value="women">Women&apos;s</SelectItem>
                          <SelectItem value="co-ed">Co-ed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxTeams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Teams</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Fee ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minPlayersPerTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Players</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxPlayersPerTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Players</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSportMutation.isPending}>
                    {createSportMutation.isPending ? "Creating..." : "Create Sport"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(sports?.length ?? 0) > 0 ? (
          (sports as Sport[]).map((sport) => (
            <Card key={sport.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{sport.name}</h3>
                      <p className="text-sm text-muted-foreground">{getCurrentSeason()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <Badge variant="outline">
                      {sport.gender === 'men' ? "Men's" : sport.gender === 'women' ? "Women's" : "Co-ed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Teams</span>
                    <span className="text-foreground font-medium">{sport.maxTeams}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players per Team</span>
                    <span className="text-foreground font-medium">
                      {sport.minPlayersPerTeam}-{sport.maxPlayersPerTeam}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Fee</span>
                    <span className="text-foreground font-medium">${sport.teamFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={sport.status === 'active' ? 'default' : 'secondary'}>
                      {sport.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Sports Added</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first sport
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sport
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}