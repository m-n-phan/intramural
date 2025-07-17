import type { Request, RequestHandler } from "express";
import type { UserRole, User } from "@shared/schema";
import { USER_ROLES } from "@shared/schema";
import { storage } from "./storage";

interface AuthenticatedRequest extends Request {
  auth: {
    userId?: string;
  };
  currentUser?: User;
}

// Role-based access control middleware
export const requireRole = (requiredRoles: UserRole | UserRole[]): RequestHandler => {
  return (req: Request, res, next) => {
    void (async () => {
      const authReq = req as AuthenticatedRequest;
      try {
        if (!authReq.auth.userId) {
          res.status(401).json({ message: "User not authenticated" });
          return;
        }

        const userId = authReq.auth.userId;
        if (!userId) {
          res.status(401).json({ message: "User ID not found" });
          return;
        }

        const user = await storage.getUser(userId);
        if (!user) {
          res.status(401).json({ message: "User not found" });
          return;
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        if (!roles.includes(user.role)) {
          res.status(403).json({ 
            message: `Access denied. Required role: ${roles.join(' or ')}. Current role: ${user.role}` 
          });
          return;
        }

        // Attach user to request for easier access
        authReq.currentUser = user;
        next();
      } catch (error) {
        console.error("Role auth error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    })();
  };
};

// Check if user has specific role
export const hasRole = (userRole: string, requiredRoles: UserRole | UserRole[]): boolean => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole as UserRole);
};

// Admin-only middleware
export const requireAdmin = requireRole(USER_ROLES.ADMIN);

// Captain or admin middleware
export const requireCaptainOrAdmin = requireRole([USER_ROLES.CAPTAIN, USER_ROLES.ADMIN]);

// Referee or admin middleware
export const requireRefereeOrAdmin = requireRole([USER_ROLES.REFEREE, USER_ROLES.ADMIN]);
