import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema, Team, Sport, InsertGame } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMemo, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface GameFormProps {
  onSubmit: (data: Partial<InsertGame>) => void;
  isPending: boolean;
  sports: Sport[] | undefined;
  teams: Team[] | undefined;
  initialValues?: Partial<InsertGame>;
  onCancel: () => void;
  submitButtonText?: string;
}

export function GameForm({ onSubmit, isPending, sports, teams, initialValues, onCancel, submitButtonText = "Submit" }: GameFormProps) {
  const { isAdmin } = useAuth();
  const form = useForm<Partial<InsertGame>>({
    resolver: zodResolver(insertGameSchema.partial()),
    defaultValues: initialValues || {
      sportId: 0,
      homeTeamId: 0,
      awayTeamId: 0,
      gender: "co-ed",
      scheduledAt: new Date(),
      venue: "",
      status: "scheduled",
    },
  });

  const watchedSportId = form.watch("sportId");
  const watchedGender = form.watch("gender");
  const watchedHomeTeamId = form.watch("homeTeamId");

  const selectedHomeTeam = useMemo(() => {
    return Array.isArray(teams) ? teams.find((team) => team.id === watchedHomeTeamId) : null;
  }, [teams, watchedHomeTeamId]);

  const selectedDivision = selectedHomeTeam?.division;

  const eligibleTeams = useMemo(() => {
    if (!teams || !Array.isArray(teams) || !watchedSportId || !watchedGender) return [];
    return teams.filter((team: Team) => 
      team.sportId === watchedSportId && 
      team.gender === watchedGender
    );
  }, [teams, watchedSportId, watchedGender]);

  const eligibleAwayTeams = useMemo(() => {
    return eligibleTeams.filter((team: Team) => team.id !== watchedHomeTeamId && (!selectedDivision || team.division === selectedDivision));
  }, [eligibleTeams, watchedHomeTeamId, selectedDivision]);

  useEffect(() => {
    if (watchedHomeTeamId && form.getValues("awayTeamId")) {
      const awayTeam = teams?.find((team) => team.id === form.getValues("awayTeamId"));
      if (awayTeam && (awayTeam.division !== selectedDivision || awayTeam.gender !== watchedGender)) {
        form.setValue("awayTeamId", 0);
      }
    }
  }, [watchedHomeTeamId, watchedGender, selectedDivision, teams, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sportId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() ?? ""} disabled={!isAdmin}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.isArray(sports) && sports.map((sport) => (
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
              <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!isAdmin}>
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
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() ?? ""} disabled={!isAdmin}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eligibleTeams.map((team) => (
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
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() ?? ""} disabled={!isAdmin}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eligibleAwayTeams.length > 0 ? (
                      eligibleAwayTeams.map((team) => (
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
                {eligibleAwayTeams.length === 0 && watchedHomeTeamId && watchedHomeTeamId > 0 && (
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
                <Input 
                  type="datetime-local" 
                  {...field} 
                  value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} 
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  disabled={!isAdmin}
                />
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
                <Input placeholder="Court 1, Gym 2, etc." {...field} value={field.value ?? ""} disabled={!isAdmin} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="homeScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Home Score</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="awayScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Away Score</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
