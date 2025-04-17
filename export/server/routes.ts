import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { 
  insertVenueSchema, 
  insertShiftSchema, 
  insertTimeEntrySchema, 
  insertMessageSchema,
  insertTillVerificationSchema,
  Permissions,
  User,
  UserRole 
} from "@shared/schema";
import { 
  requireAdmin, 
  requireSuperAdmin, 
  requirePermission, 
  requireVenueAccess,
  requireSelfOrPermission,
  hasPermission,
  hasVenueAccess
} from "./middleware/permissions";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Global rate limiter to protect against DoS attacks
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later' },
    skip: (req: Request) => {
      // Skip rate limiting for GET requests as they're typically less resource-intensive
      // and don't modify state
      return req.method === 'GET';
    }
  });

  // Apply rate limiting to all API routes except GET requests
  app.use('/api', apiLimiter);

  // Middleware to log API requests
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });

  // Users endpoints
  app.get("/api/users", requirePermission(Permissions.VIEW_ALL_USERS), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/employees", requirePermission(Permissions.VIEW_ALL_USERS), async (req, res) => {
    try {
      const employees = await storage.getUsersByRole("employee");
      // Remove password from response
      const sanitizedEmployees = employees.map(({ password, ...employee }) => employee);
      res.json(sanitizedEmployees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/users/:id", requireSelfOrPermission("id", Permissions.VIEW_ALL_USERS), async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", requireSelfOrPermission("id", Permissions.MANAGE_USERS), async (req, res) => {
    try {
      const userId = Number(req.params.id);
      
      // Ensure user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add validation for role changes - only admins can change roles
      if (req.body.role && req.body.role !== existingUser.role) {
        if (!hasPermission(req.user as User, Permissions.MANAGE_USERS)) {
          return res.status(403).json({ message: "You do not have permission to change user roles" });
        }
        
        // Prevent non-super-admins from creating super admins
        if (req.body.role === UserRole.SUPER_ADMIN && (req.user as User).role !== UserRole.SUPER_ADMIN) {
          return res.status(403).json({ message: "Only owners can create or modify owner accounts" });
        }
      }
      
      // Update user data
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Venues endpoints
  app.get("/api/venues", requirePermission(Permissions.VIEW_ALL_VENUES), async (req, res) => {
    try {
      const venues = await storage.getAllVenues();
      res.json(venues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  app.post("/api/venues", requirePermission(Permissions.MANAGE_VENUES), async (req, res) => {
    try {
      // Validate request data
      const validatedData = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue(validatedData);
      res.status(201).json(venue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid venue data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create venue" });
      }
    }
  });

  app.get("/api/venues/:id", requireVenueAccess(), async (req, res) => {
    try {
      const venue = await storage.getVenue(Number(req.params.id));
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  app.patch("/api/venues/:id", requirePermission(Permissions.MANAGE_VENUES), requireVenueAccess(), async (req, res) => {
    try {
      const venueId = Number(req.params.id);
      
      // Ensure venue exists
      const existingVenue = await storage.getVenue(venueId);
      if (!existingVenue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      const updatedVenue = await storage.updateVenue(venueId, req.body);
      if (!updatedVenue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(updatedVenue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update venue" });
    }
  });

  app.delete("/api/venues/:id", requirePermission(Permissions.MANAGE_VENUES), requireVenueAccess(), async (req, res) => {
    try {
      const deleted = await storage.deleteVenue(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete venue" });
    }
  });

  // Shifts endpoints
  app.get("/api/shifts", requirePermission(Permissions.VIEW_ALL_SHIFTS), async (req, res) => {
    try {
      // Handle date range query params
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        const shifts = await storage.getShiftsByDateRange(startDate, endDate);
        return res.json(shifts);
      }
      
      // Handle venue filter
      if (req.query.venueId) {
        const venueId = Number(req.query.venueId);
        if (isNaN(venueId)) {
          return res.status(400).json({ message: "Invalid venue ID" });
        }
        
        // Check venue access before returning shifts
        if (!hasVenueAccess(req.user as User, venueId)) {
          return res.status(403).json({ message: "You don't have access to this venue" });
        }
        
        const shifts = await storage.getShiftsByVenue(venueId);
        return res.json(shifts);
      }
      
      // Handle employee filter
      if (req.query.employeeId) {
        const employeeId = Number(req.query.employeeId);
        if (isNaN(employeeId)) {
          return res.status(400).json({ message: "Invalid employee ID" });
        }
        
        // Users can only see their own shifts unless they have permission
        if (employeeId !== (req.user as User).id && 
            !hasPermission(req.user as User, Permissions.VIEW_ALL_SHIFTS)) {
          return res.status(403).json({ message: "You don't have permission to view other employees' shifts" });
        }
        
        const shifts = await storage.getShiftsByEmployee(employeeId);
        return res.json(shifts);
      }
      
      // Get all shifts if no filters - requires permission
      const shifts = await storage.getAllShifts();
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const venueId = req.body.venueId;
      
      // Check if user has permission to manage shifts
      const hasGlobalPermission = hasPermission(req.user as User, Permissions.MANAGE_ALL_SHIFTS);
      const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_SHIFTS) && 
                                hasVenueAccess(req.user as User, venueId);
      
      if (!hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ 
          message: "You don't have permission to create shifts for this venue" 
        });
      }
      
      // Validate request data
      const validatedData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validatedData);
      res.status(201).json(shift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shift data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create shift" });
      }
    }
  });

  app.get("/api/shifts/:id", async (req, res) => {
    try {
      const shift = await storage.getShift(Number(req.params.id));
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Check venue access or if it's the user's own shift
      const isOwnShift = shift.employeeId === (req.user as User).id;
      const hasShiftPermission = hasPermission(req.user as User, Permissions.VIEW_ALL_SHIFTS);
      const hasVenuePermissionForShift = hasVenueAccess(req.user as User, shift.venueId);
      
      if (!isOwnShift && !hasShiftPermission && !hasVenuePermissionForShift) {
        return res.status(403).json({ message: "You don't have permission to view this shift" });
      }
      
      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  app.patch("/api/shifts/:id", async (req, res) => {
    try {
      const shiftId = Number(req.params.id);
      
      // Ensure shift exists
      const existingShift = await storage.getShift(shiftId);
      if (!existingShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Check if user has permission to manage this shift
      const hasGlobalPermission = hasPermission(req.user as User, Permissions.MANAGE_ALL_SHIFTS);
      const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_SHIFTS) && 
                                hasVenueAccess(req.user as User, existingShift.venueId);
      
      if (!hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ 
          message: "You don't have permission to update shifts for this venue" 
        });
      }
      
      const updatedShift = await storage.updateShift(shiftId, req.body);
      if (!updatedShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.json(updatedShift);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shift" });
    }
  });

  app.delete("/api/shifts/:id", async (req, res) => {
    try {
      const shiftId = Number(req.params.id);
      
      // Ensure shift exists before checking permissions
      const existingShift = await storage.getShift(shiftId);
      if (!existingShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Check if user has permission to delete this shift
      const hasGlobalPermission = hasPermission(req.user as User, Permissions.MANAGE_ALL_SHIFTS);
      const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_SHIFTS) && 
                                hasVenueAccess(req.user as User, existingShift.venueId);
      
      if (!hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ 
          message: "You don't have permission to delete shifts for this venue" 
        });
      }
      
      const deleted = await storage.deleteShift(shiftId);
      if (!deleted) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shift" });
    }
  });

  // Time entries endpoints
  app.get("/api/time-entries", async (req, res) => {
    try {
      // Handle employee filter
      if (req.query.employeeId) {
        const employeeId = Number(req.query.employeeId);
        if (isNaN(employeeId)) {
          return res.status(400).json({ message: "Invalid employee ID" });
        }
        
        const timeEntries = await storage.getTimeEntriesByEmployee(employeeId);
        return res.json(timeEntries);
      }
      
      // Handle shift filter
      if (req.query.shiftId) {
        const shiftId = Number(req.query.shiftId);
        if (isNaN(shiftId)) {
          return res.status(400).json({ message: "Invalid shift ID" });
        }
        
        const timeEntries = await storage.getTimeEntriesByShift(shiftId);
        return res.json(timeEntries);
      }
      
      // Handle date range filter
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        const timeEntries = await storage.getTimeEntriesByDateRange(startDate, endDate);
        return res.json(timeEntries);
      }

      // Only admin or IT should see all time entries
      if (req.isAuthenticated() && (req.user.role === "admin" || req.user.role === "it")) {
        // Get all time entries
        const timeEntries = await Promise.all([
          ...Array.from({ length: req.user.id }).map((_, i) => 
            storage.getTimeEntriesByEmployee(i + 1)
          )
        ]).then(results => results.flat());
        return res.json(timeEntries);
      }
      
      // For employees, return their own time entries
      if (req.isAuthenticated()) {
        const timeEntries = await storage.getTimeEntriesByEmployee(req.user.id);
        return res.json(timeEntries);
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", async (req, res) => {
    try {
      // Validate request data
      const validatedData = insertTimeEntrySchema.parse(req.body);
      
      // Ensure the employee exists
      const employee = await storage.getUser(validatedData.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Ensure the shift exists
      const shift = await storage.getShift(validatedData.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      const timeEntry = await storage.createTimeEntry(validatedData);
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create time entry" });
      }
    }
  });

  app.patch("/api/time-entries/:id", async (req, res) => {
    try {
      const timeEntryId = Number(req.params.id);
      
      // Ensure time entry exists
      const existingTimeEntry = await storage.getTimeEntry(timeEntryId);
      if (!existingTimeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      const updatedTimeEntry = await storage.updateTimeEntry(timeEntryId, req.body);
      if (!updatedTimeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(updatedTimeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  // Messages endpoints
  app.get("/api/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/unread", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const unreadMessages = await storage.getUnreadMessages(userId);
      res.json(unreadMessages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Set the current user as sender
      const messageData = {
        ...req.body,
        senderId: req.user.id
      };
      
      // Validate request data
      const validatedData = insertMessageSchema.parse(messageData);
      
      // Create the message
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  app.patch("/api/messages/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const messageId = Number(req.params.id);
      
      // Ensure message exists
      const existingMessage = await storage.getMessage(messageId);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow updating isRead status
      const updatedMessage = await storage.updateMessage(messageId, { isRead: req.body.isRead });
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Till verification endpoints
  app.get("/api/till-verifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Handle shift filter
      if (req.query.shiftId) {
        const shiftId = Number(req.query.shiftId);
        if (isNaN(shiftId)) {
          return res.status(400).json({ message: "Invalid shift ID" });
        }
        
        // Get shift to check venue access
        const shift = await storage.getShift(shiftId);
        if (!shift) {
          return res.status(404).json({ message: "Shift not found" });
        }
        
        // Check if user has permission to see this shift's till verifications
        const hasGlobalPermission = hasPermission(req.user as User, Permissions.VIEW_ALL_TILLS);
        const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_TILLS) && 
                                  hasVenueAccess(req.user as User, shift.venueId);
        const isOwnShift = shift.employeeId === (req.user as User).id;
        
        if (!hasGlobalPermission && !hasVenuePermission && !isOwnShift) {
          return res.status(403).json({ message: "You don't have permission to view these till verifications" });
        }
        
        const verifications = await storage.getTillVerificationsByShift(shiftId);
        return res.json(verifications);
      }
      
      // Handle employee filter
      if (req.query.employeeId) {
        const employeeId = Number(req.query.employeeId);
        if (isNaN(employeeId)) {
          return res.status(400).json({ message: "Invalid employee ID" });
        }
        
        // Users can only see their own verifications unless they have permission
        if (employeeId !== (req.user as User).id && 
            !hasPermission(req.user as User, Permissions.VIEW_ALL_TILLS)) {
          return res.status(403).json({ 
            message: "You don't have permission to view other employees' till verifications" 
          });
        }
        
        const verifications = await storage.getTillVerificationsByEmployee(employeeId);
        return res.json(verifications);
      }
      
      // Handle date range filter
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        // Must have global view permission to see all verifications by date range
        if (!hasPermission(req.user as User, Permissions.VIEW_ALL_TILLS)) {
          return res.status(403).json({ 
            message: "You don't have permission to view all till verifications" 
          });
        }
        
        const verifications = await storage.getTillVerificationsByDateRange(startDate, endDate);
        return res.json(verifications);
      }
      
      // Check for global/specific permissions
      if (hasPermission(req.user as User, Permissions.VIEW_ALL_TILLS)) {
        // Return all verifications for users with appropriate permission
        // NOTE: In a real application we'd implement pagination here
        const users = await storage.getAllUsers();
        const employeeIds = users.map(user => user.id);
        
        // Get verifications for all employees
        const verificationPromises = employeeIds.map(id => 
          storage.getTillVerificationsByEmployee(id)
        );
        const allVerifications = (await Promise.all(verificationPromises)).flat();
        return res.json(allVerifications);
      } else {
        // Regular employees can only see their own verifications
        const verifications = await storage.getTillVerificationsByEmployee((req.user as User).id);
        return res.json(verifications);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch till verifications" });
    }
  });
  
  app.get("/api/till-verifications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = Number(req.params.id);
      const verification = await storage.getTillVerification(id);
      
      if (!verification) {
        return res.status(404).json({ message: "Till verification not found" });
      }
      
      // Get the shift to determine venue access
      const shift = await storage.getShift(verification.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Associated shift not found" });
      }
      
      // Check if user has permission to see this verification
      const isOwnVerification = verification.employeeId === (req.user as User).id;
      const hasGlobalPermission = hasPermission(req.user as User, Permissions.VIEW_ALL_TILLS);
      const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_TILLS) && 
                               hasVenueAccess(req.user as User, shift.venueId);
      
      if (!isOwnVerification && !hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ 
          message: "You don't have permission to view this till verification" 
        });
      }
      
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch till verification" });
    }
  });
  
  app.post("/api/till-verifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request data
      const validatedData = insertTillVerificationSchema.parse(req.body);
      
      // Ensure the employee exists
      const employee = await storage.getUser(validatedData.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Ensure the shift exists and get venue info
      const shift = await storage.getShift(validatedData.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Check permissions for creating till verifications
      const isOwnVerification = validatedData.employeeId === (req.user as User).id;
      const hasGlobalPermission = hasPermission(req.user as User, Permissions.MANAGE_ALL_TILLS);
      const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_TILLS) && 
                               hasVenueAccess(req.user as User, shift.venueId);
      
      // Either creating for self or has appropriate permissions
      if (!isOwnVerification && !hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ 
          message: "You don't have permission to create till verifications for this employee"
        });
      }
      
      // Set verified status based on permissions
      const canAutoVerify = hasGlobalPermission || hasVenuePermission;
      
      // Create the till verification
      const verification = await storage.createTillVerification({
        ...validatedData,
        verifiedBy: canAutoVerify ? (req.user as User).id : null
      });
      
      res.status(201).json(verification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid till verification data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create till verification" });
      }
    }
  });
  
  app.patch("/api/till-verifications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const verificationId = Number(req.params.id);
      
      // Ensure verification exists
      const existingVerification = await storage.getTillVerification(verificationId);
      if (!existingVerification) {
        return res.status(404).json({ message: "Till verification not found" });
      }
      
      // Get associated shift for venue access check
      const shift = await storage.getShift(existingVerification.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Associated shift not found" });
      }
      
      // Define permission flags
      const isOwnVerification = existingVerification.employeeId === (req.user as User).id;
      const hasGlobalPermission = hasPermission(req.user as User, Permissions.MANAGE_ALL_TILLS);
      const hasVenuePermission = hasPermission(req.user as User, Permissions.MANAGE_VENUE_TILLS) && 
                               hasVenueAccess(req.user as User, shift.venueId);
      
      // Check if user has any permission to update
      if (!isOwnVerification && !hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ message: "You don't have permission to update this till verification" });
      }
      
      // Set up update permissions based on role
      let updateData = req.body;
      
      // Regular employees can only update notes on their own verifications and only if not verified
      if (!hasGlobalPermission && !hasVenuePermission) {
        if (existingVerification.verifiedBy) {
          return res.status(403).json({ message: "Cannot modify a verified till report" });
        }
        // Restrict to notes only
        updateData = { notes: req.body.notes };
      }
      
      // Check if this is a verification request
      const isVerifyingTill = req.body.verifiedBy === true || req.body.verifiedAt;
      
      // Only users with manage permissions can verify tills
      if (isVerifyingTill && !hasGlobalPermission && !hasVenuePermission) {
        return res.status(403).json({ 
          message: "Only managers with venue access or administrators can verify tills" 
        });
      }
      
      // Set verifiedBy to current user if they're verifying
      if (isVerifyingTill && (hasGlobalPermission || hasVenuePermission)) {
        updateData = {
          ...updateData,
          verifiedBy: (req.user as User).id,
          verifiedAt: new Date()
        };
      }
      
      const updatedVerification = await storage.updateTillVerification(verificationId, updateData);
      if (!updatedVerification) {
        return res.status(404).json({ message: "Till verification not found" });
      }
      
      res.json(updatedVerification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update till verification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
