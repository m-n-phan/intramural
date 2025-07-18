import type { Express, Request, Response } from "express";

interface RequestWithAuth extends Request {
  auth: {
    userId: string;
  };
}

interface ClerkWebhookEvent {
  data: {
    id:string;
    first_name?: string;
    last_name?: string;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string;
  };
  type: string;
}

interface EmailAddress {
  id: string;
  email_address: string;
}
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { requireAdmin, requireCaptainOrAdmin, requireRefereeOrAdmin, requireRole } from "./roleAuth";
import type { User, Invite, UserRole } from "@shared/schema";
import { insertSportSchema, insertTeamSchema, insertGameSchema, USER_ROLES } from "@shared/schema";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import { generateRoundRobinSchedule } from "./scheduleGenerator.js";
import { addDays, parseISO } from "date-fns";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export function registerRoutes(app: Express): Server {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use(ClerkExpressWithAuth());

  // Webhook handler for Clerk. "express.raw" middleware is mounted at the app
  // level so the request body arrives as a Buffer here for signature
  // verification.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.post('/api/webhooks/clerk', async (req, res) => {
    try {
      const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
      if (!WEBHOOK_SECRET) {
        return res.status(500).json({ message: "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local" });
      }

      const svix_id = req.headers["svix-id"] as string;
      const svix_timestamp = req.headers["svix-timestamp"] as string;
      const svix_signature = req.headers["svix-signature"] as string;

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ message: "Error occured -- no svix headers" });
      }

      const payload = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
      
      const wh = new Webhook(WEBHOOK_SECRET);

      let evt;
      try {
        evt = wh.verify(payload, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        }) as ClerkWebhookEvent;
      } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ 'message': err instanceof Error ? err.message : 'Unknown error' });
      }

      const { id } = evt.data;
      const eventType = evt.type;

      if (eventType === 'user.created' || eventType === 'user.updated') {
        const { first_name, last_name, email_addresses, primary_email_address_id } = evt.data;
        const email = email_addresses?.find((e: EmailAddress) => e.id === primary_email_address_id)?.email_address;
        await storage.upsertUser({
          id: id,
          firstName: first_name,
          lastName: last_name,
          email: email,
        });
      }

      res.status(200).json({ response: "Success" });
    } catch (error) {
      console.error("Error in clerk webhook:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', (req, res) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
      try {
        const userId = authReq.auth.userId;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    })();
  });

  // Onboarding routes
  app.post('/api/onboarding/complete', (req, res) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
      try {
        const userId = authReq.auth.userId;
        const onboardingData = req.body as {
          interests: string[];
          experience: string;
          availability: string;
          notifications: boolean;
        };
        const updatedUser = await storage.updateUser(userId, {
          onboardingCompleted: true,
          interests: onboardingData.interests,
          experience: onboardingData.experience,
          availability: onboardingData.availability,
          notifications: onboardingData.notifications
        });
        res.json(updatedUser);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        res.status(500).json({ message: "Failed to complete onboarding" });
      }
    })();
  });

  // Role management endpoints
  app.put('/api/users/:id/role', requireAdmin, (req, res) => {
    void (async () => {
      try {
        const { id } = req.params;
        const { role } = req.body as { role: UserRole };
        
        if (!Object.values(USER_ROLES).includes(role)) {
          return res.status(400).json({ message: "Invalid role" });
        }
        
        const user = await storage.updateUserRole(id, role);
        res.json(user);
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role" });
      }
    })();
  });

  app.get('/api/users', requireAdmin, (req, res) => {
    void (async () => {
      try {
        const users = await storage.getAllUsers();
        res.json({ users });
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users", users: [] });
      }
    })();
  });

  app.put('/api/auth/user', (req, res) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
      try {
        const userId = authReq.auth.userId;
        if (!userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const { firstName, lastName, email } = req.body as {
          firstName: string;
          lastName: string;
          email: string;
        };
        const updatedUser = await storage.updateUser(userId, {
          firstName,
          lastName,
          email
        });
        
        res.json(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
    })();
  });

  // Sports routes
  app.get('/api/sports', (req, res) => {
    void (async () => {
      try {
        const sports = await storage.getSports();
        res.json(sports);
      } catch (error) {
        console.error("Error fetching sports:", error);
        res.status(500).json({ message: "Failed to fetch sports" });
      }
    })();
  });

  app.get('/api/sports/:id', (req, res) => {
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        const sport = await storage.getSport(id);
        if (!sport) {
          return res.status(404).json({ message: "Sport not found" });
        }
        res.json(sport);
      } catch (error) {
        console.error("Error fetching sport:", error);
        res.status(500).json({ message: "Failed to fetch sport" });
      }
    })();
  });

  app.post('/api/sports', requireAdmin, (req, res) => {
    void (async () => {
      try {
        const sportData = insertSportSchema.parse(req.body);
        const sport = await storage.createSport(sportData);
        res.json(sport);
      } catch (error) {
        console.error("Error creating sport:", error);
        res.status(500).json({ message: "Failed to create sport" });
      }
    })();
  });

  app.put('/api/sports/:id', requireAdmin, (req, res) => {
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        const sportData = insertSportSchema.partial().parse(req.body);
        const sport = await storage.updateSport(id, sportData);
        res.json(sport);
      } catch (error) {
        console.error("Error updating sport:", error);
        res.status(500).json({ message: "Failed to update sport" });
      }
    })();
  });

  app.delete('/api/sports/:id', requireAdmin, (req, res) => {
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteSport(id);
        res.json({ message: "Sport deleted successfully" });
      } catch (error) {
        console.error("Error deleting sport:", error);
        res.status(500).json({ message: "Failed to delete sport" });
      }
    })();
  });

  // Teams routes
  app.get('/api/teams', (req, res) => {
    void (async () => {
      try {
        const { search, sportId } = req.query;
        const teams = await storage.getTeams({
          search: search as string | undefined,
          sportId: sportId ? parseInt(sportId as string) : undefined,
        });
        res.json(teams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Failed to fetch teams" });
      }
    })();
  });

  app.get('/api/teams/sport/:sportId', (req, res) => {
    void (async () => {
      try {
        const sportId = parseInt(req.params.sportId);
        const teams = await storage.getTeamsBySport(sportId);
        res.json(teams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Failed to fetch teams" });
      }
    })();
  });

  app.get('/api/teams/:id', (req, res) => {
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        const team = await storage.getTeam(id);
        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }
        res.json(team);
      } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ message: "Failed to fetch team" });
      }
    })();
  });

  app.post('/api/teams', requireRole([USER_ROLES.ADMIN, USER_ROLES.CAPTAIN]), (req: Request, res: Response) => {
    const authReq = req as RequestWithAuth;
    if (!authReq.auth.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    void (async () => {
      try {
        const teamData = insertTeamSchema.parse({
          ...req.body,
          captainId: authReq.auth.userId,
        });
        const team = await storage.createTeam(teamData);
        res.json(team);
      } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ message: "Failed to create team" });
      }
    })();
  });

interface RequestWithAuthAndUser extends Request {
  auth: { userId: string; };
  currentUser: User; // Assuming requireRole attaches the user
}

app.put('/api/teams/:id', requireCaptainOrAdmin, (req: Request, res: Response) => {
    const authReq = req as RequestWithAuthAndUser;
    void (async () => {
      try {
          const id = parseInt(req.params.id);
          const teamToUpdate = await storage.getTeam(id);

          if (!teamToUpdate) {
              return res.status(404).json({ message: "Team not found" });
          }

          // Ownership Check: User must be an Admin OR the captain of this specific team.
          if (authReq.currentUser.role !== USER_ROLES.ADMIN && teamToUpdate.captainId !== authReq.auth.userId) {
              return res.status(403).json({ message: "Forbidden: You do not have permission to edit this team." });
          }

          const teamData = insertTeamSchema.partial().parse(req.body);
          const team = await storage.updateTeam(id, teamData);
          res.json(team);
      } catch (error) {
          console.error("Error updating team:", error);
          res.status(500).json({ message: "Failed to update team" });
      }
    })();
});

  app.delete('/api/teams/:id', requireCaptainOrAdmin, (req, res) => {
    const authReq = req as RequestWithAuthAndUser;
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        const teamToDelete = await storage.getTeam(id);

        if (!teamToDelete) {
          return res.status(404).json({ message: "Team not found" });
        }

        if (authReq.currentUser.role !== USER_ROLES.ADMIN && teamToDelete.captainId !== authReq.auth.userId) {
          return res.status(403).json({ message: "Forbidden: You do not have permission to delete this team." });
        }

        await storage.deleteTeam(id);
        res.json({ message: "Team deleted successfully" });
      } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({ message: "Failed to delete team" });
      }
    })();
  });

  // Team member routes
  app.get('/api/teams/:id/members', (req, res) => {
    void (async () => {
      try {
        const teamId = parseInt(req.params.id);
        const members = await storage.getTeamMembers(teamId);
        res.json(members);
      } catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({ message: "Failed to fetch team members" });
      }
    })();
  });

  app.post('/api/teams/:id/members', requireCaptainOrAdmin, (req, res) => {
    const authReq = req as RequestWithAuthAndUser;
    void (async () => {
      try {
        const teamId = parseInt(req.params.id);
        const { userId } = req.body as { userId: string };

        const team = await storage.getTeam(teamId);
        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }

        if (authReq.currentUser.role !== USER_ROLES.ADMIN && team.captainId !== authReq.auth.userId) {
          return res.status(403).json({ message: "Forbidden: You do not have permission to add members to this team." });
        }
        
        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        const member = await storage.addTeamMember({
          teamId,
          userId,
          role: 'player',
        });
        
        res.json(member);
      } catch (error) {
        console.error("Error adding team member:", error);
        res.status(500).json({ message: "Failed to add team member" });
      }
    })();
  });

  app.delete('/api/teams/:teamId/members/:userId', requireCaptainOrAdmin, (req, res) => {
    const authReq = req as RequestWithAuthAndUser;
    void (async () => {
      try {
        const teamId = parseInt(req.params.teamId);
        const userId = req.params.userId;

        const team = await storage.getTeam(teamId);
        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }

        if (authReq.currentUser.role !== USER_ROLES.ADMIN && team.captainId !== authReq.auth.userId) {
          return res.status(403).json({ message: "Forbidden: You do not have permission to remove members from this team." });
        }
        
        await storage.removeTeamMember(teamId, userId);
        res.json({ message: "Team member removed successfully" });
      } catch (error) {
        console.error("Error removing team member:", error);
        res.status(500).json({ message: "Failed to remove team member" });
      }
    })();
  });

  // Team invitation and request routes
  app.post('/api/teams/:teamId/invites', requireCaptainOrAdmin, (req, res) => {
    const authReq = req as RequestWithAuthAndUser;
    void (async () => {
      try {
        const teamId = parseInt(req.params.teamId);
        const { userId } = req.body as { userId: string };
        const inviterId = authReq.auth.userId;

        const team = await storage.getTeam(teamId);
        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }

        if (authReq.currentUser.role !== USER_ROLES.ADMIN && team.captainId !== authReq.auth.userId) {
          return res.status(403).json({ message: "Forbidden: You do not have permission to invite members to this team." });
        }

        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }

        const invitation = await storage.createTeamInvitation({
          teamId,
          userId,
          type: 'invite',
          invitedBy: inviterId,
        });
        
        res.json(invitation);
      } catch (error) {
        console.error("Error creating team invitation:", error);
        res.status(500).json({ message: "Failed to create team invitation" });
      }
    })();
  });

  app.post('/api/teams/:teamId/requests', (req: Request, res: Response) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
      try {
        const teamId = parseInt(req.params.teamId);
        const userId = authReq.auth.userId;

        const request = await storage.createTeamInvitation({
          teamId,
          userId,
          type: 'request',
        });
        
        res.json(request);
      } catch (error) {
        console.error("Error creating team join request:", error);
        res.status(500).json({ message: "Failed to create team join request" });
      }
    })();
  });

  app.get('/api/teams/:teamId/invites', requireCaptainOrAdmin, (req: Request, res: Response) => {
    void (async () => {
      try {
        const teamId = parseInt(req.params.teamId);
        const requests = await storage.getTeamJoinRequests(teamId);
        res.json(requests);
      } catch (error) {
        console.error("Error fetching team join requests:", error);
        res.status(500).json({ message: "Failed to fetch team join requests" });
      }
    })();
  });

  app.get('/api/users/me/invites', (req: Request, res: Response) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
      try {
        const userId = authReq.auth.userId;
        const invites = await storage.getUserTeamInvitations(userId);
        res.json(invites);
      } catch (error) {
        console.error("Error fetching user team invitations:", error);
        res.status(500).json({ message: "Failed to fetch user team invitations" });
      }
    })();
  });

  app.put('/api/invites/:inviteId', (req: Request, res: Response) => {
    const authReq = req as RequestWithAuthAndUser;
    void (async () => {
      try {
        const inviteId = parseInt(req.params.inviteId);
        const { status } = req.body as { status: 'accepted' | 'declined' };
        const userId = authReq.auth.userId;

        if (!['accepted', 'declined'].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        const invitationToUpdate: Invite | undefined = await storage.getTeamInvitation(inviteId);

        if (!invitationToUpdate) {
          return res.status(404).json({ message: "Invitation not found" });
        }

        const team = await storage.getTeam(invitationToUpdate.teamId);

        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }

        const isCaptain = team.captainId === userId;
        const isInvitedUser = invitationToUpdate.userId === userId;

        if (authReq.currentUser.role !== USER_ROLES.ADMIN && !isCaptain && !isInvitedUser) {
          return res.status(403).json({ message: "Forbidden: You do not have permission to update this invitation." });
        }

        const invitation = await storage.updateTeamInvitationStatus(inviteId, status);
        
        res.json(invitation);
      } catch (error) {
        console.error("Error updating team invitation:", error);
        res.status(500).json({ message: "Failed to update team invitation" });
      }
    })();
  });

  app.put('/api/teams/:teamId/members/:userId', requireCaptainOrAdmin, (req, res) => {
    void (async () => {
      try {
        const teamId = parseInt(req.params.teamId);
        const userId = req.params.userId;
        const { role } = req.body as { role: 'captain' | 'player' };

        if (!['captain', 'player'].includes(role)) {
          return res.status(400).json({ message: "Invalid role" });
        }

        const member = await storage.updateTeamMemberRole(teamId, userId, role);
        res.json(member);
      } catch (error) {
        console.error("Error updating team member role:", error);
        res.status(500).json({ message: "Failed to update team member role" });
      }
    })();
  });

  app.put('/api/teams/:teamId/settings', requireCaptainOrAdmin, (req, res) => {
    void (async () => {
      try {
        const teamId = parseInt(req.params.teamId);
        const { profileImageUrl, captainOnlyInvites } = req.body as {
          profileImageUrl: string;
          captainOnlyInvites: boolean;
        };

        const team = await storage.updateTeam(teamId, {
          profileImageUrl,
          captainOnlyInvites,
        });
        
        res.json(team);
      } catch (error) {
        console.error("Error updating team settings:", error);
        res.status(500).json({ message: "Failed to update team settings" });
      }
    })();
  });

  // Games routes
  app.get('/api/games', (req, res) => {
    void (async () => {
      try {
        const games = await storage.getGames();
        res.json(games);
      } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ message: "Failed to fetch games" });
      }
    })();
  });

  app.get('/api/games/upcoming', (req, res) => {
    void (async () => {
      try {
        const games = await storage.getUpcomingGames();
        res.json(games);
      } catch (error) {
        console.error("Error fetching upcoming games:", error);
        res.status(500).json({ message: "Failed to fetch upcoming games" });
      }
    })();
  });

  app.get('/api/games/recent', (req, res) => {
    void (async () => {
      try {
        const games = await storage.getRecentGames();
        res.json(games);
      } catch (error) {
        console.error("Error fetching recent games:", error);
        res.status(500).json({ message: "Failed to fetch recent games" });
      }
    })();
  });

  app.get('/api/games/sport/:sportId', (req, res) => {
    void (async () => {
      try {
        const sportId = parseInt(req.params.sportId);
        const games = await storage.getGamesBySport(sportId);
        res.json(games);
      } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ message: "Failed to fetch games" });
      }
    })();
  });

  app.post('/api/games', requireRefereeOrAdmin, (req, res) => {
    void (async () => {
      try {
        const gameData = insertGameSchema.parse(req.body);
        
        // Validate that both teams exist and have the same division and gender
        const homeTeam = await storage.getTeam(gameData.homeTeamId);
        const awayTeam = await storage.getTeam(gameData.awayTeamId);
        
        if (!homeTeam || !awayTeam) {
          return res.status(400).json({ message: "One or both teams not found" });
        }
        
        // Validate same division
        if (homeTeam.division !== awayTeam.division) {
          return res.status(400).json({ 
            message: "Teams must be in the same division to play each other" 
          });
        }
        
        // Validate same gender
        if (homeTeam.gender !== awayTeam.gender) {
          return res.status(400).json({ 
            message: "Teams must have the same gender category to play each other" 
          });
        }
        
        // Validate same sport
        if (homeTeam.sportId !== awayTeam.sportId) {
          return res.status(400).json({ 
            message: "Teams must be in the same sport to play each other" 
          });
        }
        
        const game = await storage.createGame(gameData);
        res.json(game);
      } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({ message: "Failed to create game" });
      }
    })();
  });

  app.post('/api/schedules/generate', requireRefereeOrAdmin, (req, res) => {
    void (async () => {
      try {
        const { sportId, division, startDate, gamesPerWeek, venue } = req.body;

        if (!sportId || !division || !startDate) {
          return res.status(400).json({ message: "Sport ID, division, and start date are required" });
        }

        const teamsInDivision = await storage.getTeams({ sportId, division });

        if (teamsInDivision.length < 2) {
          return res.status(400).json({ message: "Not enough teams in the division to generate a schedule" });
        }

        const matchups = generateRoundRobinSchedule(teamsInDivision);
        
        let gameDate = parseISO(startDate);
        const gamesToCreate = [];
        
        for (let i = 0; i < matchups.length; i++) {
          const matchup = matchups[i];
          
          if (i > 0 && i % Math.floor(gamesPerWeek) === 0) {
            gameDate = addDays(gameDate, 7);
          }

          gamesToCreate.push({
            sportId: sportId,
            homeTeamId: matchup.homeTeam.id,
            awayTeamId: matchup.awayTeam.id,
            gender: teamsInDivision[0].gender,
            scheduledAt: gameDate,
            venue: venue || "TBD",
            status: "scheduled",
          });
        }

        const games = await storage.createGames(gamesToCreate);
        res.status(201).json({ message: `${games.length} games have been scheduled successfully.`, games });

      } catch (error) {
        console.error("Error generating schedule:", error);
        res.status(500).json({ message: "Failed to generate schedule" });
      }
    })();
  });

  app.put('/api/games/:id', requireRefereeOrAdmin, (req, res) => {
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        const gameData = insertGameSchema.partial().parse(req.body);
        
        // If teams are being updated, validate they have the same division and gender
        if (gameData.homeTeamId !== undefined && gameData.awayTeamId !== undefined) {
          const homeTeam = await storage.getTeam(gameData.homeTeamId);
          const awayTeam = await storage.getTeam(gameData.awayTeamId);
          
          if (!homeTeam || !awayTeam) {
            return res.status(400).json({ message: "One or both teams not found" });
          }
          
          // Validate same division
          if (homeTeam.division !== awayTeam.division) {
            return res.status(400).json({ 
              message: "Teams must be in the same division to play each other" 
            });
          }
          
          // Validate same gender
          if (homeTeam.gender !== awayTeam.gender) {
            return res.status(400).json({ 
              message: "Teams must have the same gender category to play each other" 
            });
          }
          
          // Validate same sport
          if (homeTeam.sportId !== awayTeam.sportId) {
            return res.status(400).json({ 
              message: "Teams must be in the same sport to play each other" 
            });
          }
        }
        
        const game = await storage.updateGame(id, gameData);
        
        // Broadcast score update via WebSocket
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'gameUpdate',
              game: game
            }));
          }
        });
        
        res.json(game);
      } catch (error) {
        console.error("Error updating game:", error);
        res.status(500).json({ message: "Failed to update game" });
      }
    })();
  });

  app.delete('/api/games/:id', requireRefereeOrAdmin, (req, res) => {
    void (async () => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteGame(id);
        res.json({ message: "Game deleted successfully" });
      } catch (error) {
        console.error("Error deleting game:", error);
        res.status(500).json({ message: "Failed to delete game" });
      }
    })();
  });

  // Analytics routes
  app.get('/api/analytics/overview', requireAdmin, (req, res) => {
    void (async () => {
      try {
        const [teamStats, participationStats, revenueStats] = await Promise.all([
          storage.getTeamStats(),
          storage.getParticipationStats(),
          storage.getRevenueStats()
        ]);
        
        res.json({
          activeTeams: teamStats.totalTeams,
          totalPlayers: participationStats.totalPlayers,
          totalRevenue: revenueStats.totalRevenue,
          paidTeams: revenueStats.paidTeams,
          pendingRevenue: revenueStats.pendingRevenue
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
      }
    })();
  });

  // Payment routes
  app.post("/api/create-payment-intent", (req, res) => {
    void (async () => {
      try {
        const { amount } = req.body as { amount: unknown };
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          return res.status(400).json({ message: "Invalid amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parsedAmount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            userId: (req as RequestWithAuth).auth.userId || 'unknown',
          },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: "Error creating payment intent: " + errorMessage });
      }
    })();
  });

  // Free agent routes
  app.get('/api/sports/:sportId/free-agents', requireCaptainOrAdmin, (req, res) => {
    void (async () => {
      try {
        const sportId = parseInt(req.params.sportId);
        const freeAgentsList = await storage.getFreeAgentsBySport(sportId);
        res.json(freeAgentsList);
      } catch (error) {
        console.error("Error fetching free agents:", error);
        res.status(500).json({ message: "Failed to fetch free agents" });
      }
    })();
  });

  app.post('/api/sports/:sportId/free-agents', (req, res) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
      try {
        const userId = authReq.auth.userId;
        const sportId = parseInt(req.params.sportId);
        const { notes } = req.body as { notes?: string };
        
        const isAlreadyOnTeam = await storage.isUserOnTeamForSport(userId, sportId);
        if (isAlreadyOnTeam) {
            return res.status(409).json({ message: "You are already on a team for this sport." });
        }

        await storage.createFreeAgent({ userId, sportId, notes });
        res.status(201).json({ message: "Successfully registered as a free agent." });
      } catch (error) {
        console.error("Error creating free agent entry:", error);
        res.status(500).json({ message: "Failed to register as a free agent" });
      }
    })();
  });

  app.delete('/api/sports/:sportId/free-agents', (req, res) => {
    const authReq = req as RequestWithAuth;
    void (async () => {
        try {
            const userId = authReq.auth.userId;
            const sportId = parseInt(req.params.sportId);
            await storage.deleteFreeAgent(userId, sportId);
            res.status(200).json({ message: "Successfully removed from free agency." });
        } catch (error) {
            console.error("Error deleting free agent entry:", error);
            res.status(500).json({ message: "Failed to remove from free agency" });
        }
    })();
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.warn('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const data = JSON.parse(message.toString()) as { type: string };
        console.warn('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'scoreUpdate') {
          // Broadcast score update to all connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      } catch (error) {
         
        console.error('Error parsing WebSocket message:', error instanceof Error ? error.message : JSON.stringify(error));
      }
    });
    
    ws.on('close', () => {
      console.warn('WebSocket client disconnected');
    });
  });

  return httpServer;
}
