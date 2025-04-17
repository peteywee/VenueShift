import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const UserRole = {
  SUPER_ADMIN: "super_admin", // Owner with all privileges
  ADMIN: "admin",             // Administrator with management privileges
  MANAGER: "manager",         // Venue manager with limited admin privileges
  SUPERVISOR: "supervisor",   // Shift supervisor with authority over employees
  EMPLOYEE: "employee",       // Regular staff member
  IT: "it",                   // IT support with system-level access
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// User permissions - used for RBAC
export const Permissions = {
  // User management
  MANAGE_USERS: "manage_users",           // Create, update, delete users
  VIEW_ALL_USERS: "view_all_users",       // View all user profiles
  
  // Venue management
  MANAGE_VENUES: "manage_venues",         // Create, update, delete venues
  VIEW_ALL_VENUES: "view_all_venues",     // View all venues
  
  // Shift management
  MANAGE_ALL_SHIFTS: "manage_all_shifts", // Create, update, delete shifts for all venues
  MANAGE_VENUE_SHIFTS: "manage_venue_shifts", // Manage shifts for assigned venues
  VIEW_ALL_SHIFTS: "view_all_shifts",     // View all shifts
  
  // Time entries
  MANAGE_ALL_TIME: "manage_all_time",     // Manage time entries for all employees
  MANAGE_VENUE_TIME: "manage_venue_time", // Manage time for employees at assigned venue
  VIEW_ALL_TIME: "view_all_time",         // View all time entries
  
  // Messaging
  SEND_MASS_MESSAGES: "send_mass_messages", // Send messages to multiple users
  
  // Till verification
  MANAGE_ALL_TILLS: "manage_all_tills",   // Manage till verifications for all venues
  MANAGE_VENUE_TILLS: "manage_venue_tills", // Manage tills for assigned venue
  VIEW_ALL_TILLS: "view_all_tills",       // View all till verifications
  
  // System
  SYSTEM_SETTINGS: "system_settings",     // Access to system-wide settings
} as const;

export type PermissionType = typeof Permissions[keyof typeof Permissions];

// Role to permission mapping
export const RolePermissions: Record<UserRoleType, PermissionType[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permissions),
  [UserRole.IT]: [
    Permissions.SYSTEM_SETTINGS,
    Permissions.VIEW_ALL_USERS,
    Permissions.VIEW_ALL_VENUES,
    Permissions.VIEW_ALL_SHIFTS,
    Permissions.VIEW_ALL_TIME,
    Permissions.VIEW_ALL_TILLS
  ],
  [UserRole.ADMIN]: [
    Permissions.MANAGE_USERS,
    Permissions.VIEW_ALL_USERS,
    Permissions.MANAGE_VENUES,
    Permissions.VIEW_ALL_VENUES,
    Permissions.MANAGE_ALL_SHIFTS,
    Permissions.VIEW_ALL_SHIFTS,
    Permissions.MANAGE_ALL_TIME,
    Permissions.VIEW_ALL_TIME,
    Permissions.SEND_MASS_MESSAGES,
    Permissions.MANAGE_ALL_TILLS,
    Permissions.VIEW_ALL_TILLS
  ],
  [UserRole.MANAGER]: [
    Permissions.VIEW_ALL_USERS,
    Permissions.VIEW_ALL_VENUES, 
    Permissions.MANAGE_VENUE_SHIFTS,
    Permissions.VIEW_ALL_SHIFTS,
    Permissions.MANAGE_VENUE_TIME,
    Permissions.VIEW_ALL_TIME,
    Permissions.MANAGE_VENUE_TILLS,
    Permissions.VIEW_ALL_TILLS
  ],
  [UserRole.SUPERVISOR]: [
    Permissions.VIEW_ALL_SHIFTS,
    Permissions.MANAGE_VENUE_TIME,
    Permissions.VIEW_ALL_TIME,
    Permissions.MANAGE_VENUE_TILLS
  ],
  [UserRole.EMPLOYEE]: []
};

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  profilePicture: text("profile_picture"),
  phone: text("phone"),
  assignedVenues: jsonb("assigned_venues").default([]), // Array of venue IDs the user is assigned to (for managers, supervisors)
  permissions: jsonb("permissions").default([]), // Custom permissions outside their role
  active: boolean("active").default(true), // Whether user account is active
  lastLogin: timestamp("last_login"),
  createdById: integer("created_by_id"), // Who created this user
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Venues table
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  coordinates: jsonb("coordinates"), // For geofencing/geolocation: { lat: number, lng: number }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
});

// Shifts table
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull(),
  employeeId: integer("employee_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  title: text("title"),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});

// TimeEntries table for clock in/out
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  shiftId: integer("shift_id").notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  verified: boolean("verified").default(false),
  notes: text("notes"),
  coordinates: jsonb("coordinates"), // { clockInLocation: {lat, lng}, clockOutLocation: {lat, lng} }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id"), // Null for announcements/broadcast
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
  isRead: true,
});

// Till Verification table
export const tillVerifications = pgTable("till_verifications", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  expectedAmount: integer("expected_amount").notNull(), // in cents
  actualAmount: integer("actual_amount").notNull(), // in cents
  discrepancy: integer("discrepancy"), // calculated as actualAmount - expectedAmount
  notes: text("notes"),
  verifiedBy: integer("verified_by"), // admin who verified the till
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTillVerificationSchema = createInsertSchema(tillVerifications).omit({
  id: true,
  discrepancy: true,
  verifiedAt: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, "confirmPassword">;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type TillVerification = typeof tillVerifications.$inferSelect;
export type InsertTillVerification = z.infer<typeof insertTillVerificationSchema>;
