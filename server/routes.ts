import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { requireAdmin, requireCaptainOrAdmin, requireRefereeOrAdmin, requireRole } from "./roleAuth";
import { insertSportSchema, insertTeamSchema, insertGameSchema, USER_ROLES } from "@shared/schema";
import { z } from "zod";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import express from "express";
import { Webhook } from "svix";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(ClerkExpressWithAuth());

  // Webhook handler for Clerk
  app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ message: "Error occured -- no svix headers" });
    }

    const payload = req.body;
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ 'message': err });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { first_name, last_name, email_addresses, primary_email_address_id } = evt.data;
      const email = email_addresses.find((e: any) => e.id === primary_email_address_id)?.email_address;
      await storage.upsertUser({
        id: id,
        firstName: first_name,
        lastName: last_name,
        email: email,
      });
    }

    res.status(200).json({ response: "Success" });
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding routes
  app.post('/api/onboarding/complete', async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const onboardingData = req.body;
      
      // Update user with onboarding completion
      await storage.updateUser(userId, {
        onboardingCompleted: true,
        interests: onboardingData.interests,
        experience: onboardingData.experience,
        availability: onboardingData.availability,
        notifications: onboardingData.notifications
      });
      
      res.json({ success: true, message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Role management endpoints
  app.put('/api/users/:id/role', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/auth/user', async (req, res) => {
    try {
      const userId = (req as any).auth.userId;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const { firstName, lastName, email } = req.body;
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
  });

  // Sports routes
  app.get('/api/sports', async (req, res) => {
    try {
      const sports = await storage.getSports();
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ message: "Failed to fetch sports" });
    }
  });

  app.get('/api/sports/:id', async (req, res) => {
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
  });

  app.post('/api/sports', requireAdmin, async (req, res) => {
    try {
      const sportData = insertSportSchema.parse(req.body);
      const sport = await storage.createSport(sportData);
      res.json(sport);
    } catch (error) {
      console.error("Error creating sport:", error);
      res.status(500).json({ message: "Failed to create sport" });
    }
  });

  app.put('/api/sports/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sportData = insertSportSchema.partial().parse(req.body);
      const sport = await storage.updateSport(id, sportData);
      res.json(sport);
    } catch (error) {
      console.error("Error updating sport:", error);
      res.status(500).json({ message: "Failed to update sport" });
    }
  });

  app.delete('/api/sports/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSport(id);
      res.json({ message: "Sport deleted successfully" });
    } catch (error) {
      console.error("Error deleting sport:", error);
      res.status(500).json({ message: "Failed to delete sport" });
    }
  });

  // Teams routes
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/sport/:sportId', async (req, res) => {
    try {
      const sportId = parseInt(req.params.sportId);
      const teams = await storage.getTeamsBySport(sportId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/:id', async (req, res) => {
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
  });

  app.post('/api/teams', async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.put('/api/teams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teamData = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(id, teamData);
      res.json(team);
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete('/api/teams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeam(id);
      res.json({ message: "Team deleted successfully" });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Team member routes
  app.get('/api/teams/:id/members', async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/teams/:id/members', requireCaptainOrAdmin, async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const member = await storage.addTeamMember({
        teamId,
        userId,
        role: 'player',
        joinedAt: new Date(),
      });
      
      res.json(member);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  app.delete('/api/teams/:teamId/members/:userId', requireCaptainOrAdmin, async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const userId = req.params.userId;
      
      await storage.removeTeamMember(teamId, userId);
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });

  // Games routes
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/games/upcoming', async (req, res) => {
    try {
      const games = await storage.getUpcomingGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching upcoming games:", error);
      res.status(500).json({ message: "Failed to fetch upcoming games" });
    }
  });

  app.get('/api/games/recent', async (req, res) => {
    try {
      const games = await storage.getRecentGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching recent games:", error);
      res.status(500).json({ message: "Failed to fetch recent games" });
    }
  });

  app.get('/api/games/sport/:sportId', async (req, res) => {
    try {
      const sportId = parseInt(req.params.sportId);
      const games = await storage.getGamesBySport(sportId);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post('/api/games', async (req, res) => {
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
  });

  app.put('/api/games/:id', async (req, res) => {
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
  });

  app.delete('/api/games/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGame(id);
      res.json({ message: "Game deleted successfully" });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/overview', async (req, res) => {
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
  });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: (req as any).auth.userId || 'unknown',
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
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
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}