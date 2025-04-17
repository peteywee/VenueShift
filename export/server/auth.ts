import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserRole } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Create a rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Too many login attempts, please try again later' },
    // Store to track failed attempts
    // This is a simple memory store, for production consider using Redis
    skipSuccessfulRequests: true, // Don't count successful logins
  });

  // Track failed login attempts
  const loginAttemptTracker = (req: Request, res: Response, next: NextFunction) => {
    // Log failed login attempts
    const username = req.body?.username;
    const ip = req.ip;
    
    // Store original status method
    const originalStatus = res.status;
    res.status = function(code: number) {
      if (code === 401) {
        console.warn(`Failed login attempt for user ${username} from IP ${ip}`);
      }
      return originalStatus.call(this, code);
    };
    
    next();
  };
  
  const sessionSecret = process.env.SESSION_SECRET || "shiftsync-dev-secret-key";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Rate limiter for registration to prevent abuse
  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registration requests per hour
    message: { message: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Register endpoint
  app.post("/api/register", registerLimiter, async (req, res, next) => {
    try {
      const { confirmPassword, ...userData } = req.body;
      
      if (userData.password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords don't match" });
      }
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint with rate limiting and tracking
  app.post("/api/login", 
    authLimiter, 
    loginAttemptTracker,
    (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        req.login(user, (loginErr: Error | null) => {
          if (loginErr) return next(loginErr);
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // Update user's last login time
  const updateLastLogin = async (userId: number) => {
    try {
      await storage.updateUser(userId, { lastLogin: new Date() });
    } catch (error) {
      console.error('Failed to update last login time:', error);
    }
  };
  
  // Track login after successful authentication
  app.use((req, res, next) => {
    const prevIsAuthenticated = req.isAuthenticated();
    
    // Call the next middleware
    next();
    
    // After response, check if authentication state changed to true
    if (!prevIsAuthenticated && req.isAuthenticated() && req.user) {
      updateLastLogin((req.user as SelectUser).id);
    }
  });
}
