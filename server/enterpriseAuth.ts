import * as client from "openid-client";
import { Strategy as SamlStrategy } from "passport-saml";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Enterprise SSO Configuration Interface
interface SSOConfig {
  provider: 'saml' | 'google' | 'azure' | 'okta' | 'openid';
  clientId: string;
  clientSecret?: string;
  domain?: string;
  callbackURL: string;
  // SAML-specific
  entryPoint?: string;
  cert?: string;
  // University-specific
  universityId: string;
  universityName: string;
  // User attribute mappings
  userAttributes: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    department?: string;
    studentId?: string;
  };
}

// University SSO configurations - these would be stored in database in production
const universityConfigs: Record<string, SSOConfig> = {
  'demo-university': {
    provider: 'openid',
    clientId: process.env.REPL_ID!,
    universityId: 'demo-university',
    universityName: 'Demo University',
    callbackURL: '/api/auth/callback/demo-university',
    userAttributes: {
      id: 'sub',
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      role: 'role',
      department: 'department',
      studentId: 'student_id'
    }
  },
  // Note: SAML configurations would be added when universities are onboarded
  // 'stanford-university': {
  //   provider: 'saml',
  //   clientId: 'stanford-intramural-app',
  //   universityId: 'stanford-university',
  //   universityName: 'Stanford University',
  //   callbackURL: '/api/auth/callback/stanford-university',
  //   entryPoint: 'https://login.stanford.edu/idp/profile/SAML2/Redirect/SSO',
  //   cert: process.env.STANFORD_SAML_CERT!,
  //   userAttributes: {
  //     id: 'NameID',
  //     email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  //     firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
  //     lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  //     studentId: 'http://schemas.stanford.edu/ws/2009/09/identity/claims/studentid'
  //   }
  // },
  // Note: Google OAuth configurations would be added when universities are onboarded
  // 'harvard-university': {
  //   provider: 'google',
  //   clientId: process.env.HARVARD_GOOGLE_CLIENT_ID!,
  //   clientSecret: process.env.HARVARD_GOOGLE_CLIENT_SECRET!,
  //   domain: 'harvard.edu',
  //   universityId: 'harvard-university',
  //   universityName: 'Harvard University',
  //   callbackURL: '/api/auth/callback/harvard-university',
  //   userAttributes: {
  //     id: 'id',
  //     email: 'email',
  //     firstName: 'given_name',
  //     lastName: 'family_name'
  //   }
  // },
  // Note: Azure AD configurations would be added when universities are onboarded
  // 'mit-university': {
  //   provider: 'azure',
  //   clientId: process.env.MIT_AZURE_CLIENT_ID!,
  //   clientSecret: process.env.MIT_AZURE_CLIENT_SECRET!,
  //   domain: 'mit.edu',
  //   universityId: 'mit-university',
  //   universityName: 'MIT',
  //   callbackURL: '/api/auth/callback/mit-university',
  //   userAttributes: {
  //     id: 'oid',
  //     email: 'email',
  //     firstName: 'given_name',
  //     lastName: 'family_name'
  //   }
  // }
};

// Get OpenID Connect configuration for demo/development
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(userProfile: any, universityId: string) {
  const config = universityConfigs[universityId];
  const userData = {
    id: userProfile[config.userAttributes.id],
    email: userProfile[config.userAttributes.email],
    firstName: userProfile[config.userAttributes.firstName],
    lastName: userProfile[config.userAttributes.lastName],
    universityId: universityId,
    department: userProfile[config.userAttributes.department],
    studentId: userProfile[config.userAttributes.studentId],
    // Default role based on email domain or attributes
    role: userProfile[config.userAttributes.role] || 'player'
  };
  
  await storage.upsertUser(userData);
}

export async function setupEnterpriseAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // Setup authentication strategies for each university
  for (const [universityId, config] of Object.entries(universityConfigs)) {
    switch (config.provider) {
      case 'openid':
        // OpenID Connect (for demo/development)
        const oidcConfig = await getOidcConfig();
        const { Strategy } = await import('openid-client/passport');
        
        passport.use(`openid-${universityId}`, new Strategy(
          {
            name: `openid-${universityId}`,
            config: oidcConfig,
            scope: 'openid email profile offline_access',
            callbackURL: `${getBaseUrl()}/api/auth/callback/${universityId}`,
          },
          async (tokens: any, verified: any) => {
            const user = { profile: tokens.claims(), universityId };
            await upsertUser(user.profile, universityId);
            verified(null, user);
          }
        ));
        break;

      case 'saml':
        // SAML 2.0 (common for universities)
        passport.use(`saml-${universityId}`, new SamlStrategy(
          {
            callbackUrl: `${getBaseUrl()}/api/auth/callback/${universityId}`,
            entryPoint: config.entryPoint!,
            issuer: `intramural-${universityId}`,
            cert: config.cert!,
            identifierFormat: null,
            disableRequestedAuthnContext: true,
            acceptedClockSkewMs: -1,
            signatureAlgorithm: 'sha256'
          },
          async (profile: any, done: any) => {
            const user = { profile, universityId };
            await upsertUser(profile, universityId);
            done(null, user);
          }
        ));
        break;

      case 'google':
        // Google OAuth 2.0 (Google Workspace)
        passport.use(`google-${universityId}`, new GoogleStrategy(
          {
            clientID: config.clientId,
            clientSecret: config.clientSecret!,
            callbackURL: `${getBaseUrl()}/api/auth/callback/${universityId}`,
            hostedDomain: config.domain
          },
          async (accessToken: any, refreshToken: any, profile: any, done: any) => {
            const user = { profile: profile._json, universityId };
            await upsertUser(profile._json, universityId);
            done(null, user);
          }
        ));
        break;

      case 'azure':
        // Microsoft Azure AD - placeholder for future implementation
        console.warn(`Azure AD authentication not yet implemented for ${universityId}`);
        break;
    }
  }

  // Dynamic login routes for each university
  for (const [universityId, config] of Object.entries(universityConfigs)) {
    const strategyName = `${config.provider}-${universityId}`;
    
    // Login route
    app.get(`/api/auth/login/${universityId}`, (req, res, next) => {
      passport.authenticate(strategyName, {
        scope: config.provider === 'openid' ? ['openid', 'email', 'profile'] : undefined
      })(req, res, next);
    });

    // Callback route
    app.get(`/api/auth/callback/${universityId}`, (req, res, next) => {
      passport.authenticate(strategyName, {
        successRedirect: "/",
        failureRedirect: `/login?error=auth_failed&university=${universityId}`,
      })(req, res, next);
    });
  }

  // University selection route
  app.get('/api/auth/universities', (req, res) => {
    const universities = Object.entries(universityConfigs).map(([id, config]) => ({
      id,
      name: config.universityName,
      provider: config.provider,
      loginUrl: `/api/auth/login/${id}`
    }));
    res.json(universities);
  });

  // General login route - redirects to university selection
  app.get('/api/login', (req, res) => {
    // For demo purposes, redirect to demo university
    res.redirect('/api/auth/login/demo-university');
  });

  // Logout route
  app.get('/api/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });
}

function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  }
  return 'http://localhost:5000';
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const requireUniversityAccess = (universityId: string): RequestHandler => {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as any;
    if (user.universityId !== universityId) {
      return res.status(403).json({ message: "Access denied for this university" });
    }
    
    next();
  };
};