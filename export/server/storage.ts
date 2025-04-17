import { 
  User, InsertUser, Venue, InsertVenue, Shift, InsertShift, 
  TimeEntry, InsertTimeEntry, Message, InsertMessage, UserRole,
  TillVerification, InsertTillVerification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Venue methods
  getVenue(id: number): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, venue: Partial<Venue>): Promise<Venue | undefined>;
  deleteVenue(id: number): Promise<boolean>;
  getAllVenues(): Promise<Venue[]>;
  
  // Shift methods
  getShift(id: number): Promise<Shift | undefined>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: number, shift: Partial<Shift>): Promise<Shift | undefined>;
  deleteShift(id: number): Promise<boolean>;
  getAllShifts(): Promise<Shift[]>;
  getShiftsByVenue(venueId: number): Promise<Shift[]>;
  getShiftsByEmployee(employeeId: number): Promise<Shift[]>;
  getShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]>;
  
  // Time entry methods
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry | undefined>;
  getTimeEntriesByEmployee(employeeId: number): Promise<TimeEntry[]>;
  getTimeEntriesByShift(shiftId: number): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getUnreadMessages(userId: number): Promise<Message[]>;
  
  // Till verification methods
  getTillVerification(id: number): Promise<TillVerification | undefined>;
  createTillVerification(tillVerification: InsertTillVerification): Promise<TillVerification>;
  updateTillVerification(id: number, tillVerification: Partial<TillVerification>): Promise<TillVerification | undefined>;
  getTillVerificationsByShift(shiftId: number): Promise<TillVerification[]>;
  getTillVerificationsByEmployee(employeeId: number): Promise<TillVerification[]>;
  getTillVerificationsByDateRange(startDate: Date, endDate: Date): Promise<TillVerification[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private venues: Map<number, Venue>;
  private shifts: Map<number, Shift>;
  private timeEntries: Map<number, TimeEntry>;
  private messages: Map<number, Message>;
  private tillVerifications: Map<number, TillVerification>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private venueIdCounter: number;
  private shiftIdCounter: number;
  private timeEntryIdCounter: number;
  private messageIdCounter: number;
  private tillVerificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.venues = new Map();
    this.shifts = new Map();
    this.timeEntries = new Map();
    this.messages = new Map();
    this.tillVerifications = new Map();
    
    this.userIdCounter = 1;
    this.venueIdCounter = 1;
    this.shiftIdCounter = 1;
    this.timeEntryIdCounter = 1;
    this.messageIdCounter = 1;
    this.tillVerificationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Create admin user for initial login
    this.createUser({
      username: "admin",
      password: "password", // this will be hashed in auth.ts
      fullName: "Admin User",
      email: "admin@example.com",
      role: UserRole.ADMIN,
      phone: "123-456-7890",
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
  
  // Venue methods
  async getVenue(id: number): Promise<Venue | undefined> {
    return this.venues.get(id);
  }
  
  async createVenue(venue: InsertVenue): Promise<Venue> {
    const id = this.venueIdCounter++;
    const newVenue: Venue = {
      ...venue,
      id,
      createdAt: new Date()
    };
    this.venues.set(id, newVenue);
    return newVenue;
  }
  
  async updateVenue(id: number, venueData: Partial<Venue>): Promise<Venue | undefined> {
    const venue = this.venues.get(id);
    if (!venue) return undefined;
    
    const updatedVenue = { ...venue, ...venueData };
    this.venues.set(id, updatedVenue);
    return updatedVenue;
  }
  
  async deleteVenue(id: number): Promise<boolean> {
    return this.venues.delete(id);
  }
  
  async getAllVenues(): Promise<Venue[]> {
    return Array.from(this.venues.values());
  }
  
  // Shift methods
  async getShift(id: number): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }
  
  async createShift(shift: InsertShift): Promise<Shift> {
    const id = this.shiftIdCounter++;
    const newShift: Shift = {
      ...shift,
      id,
      createdAt: new Date()
    };
    this.shifts.set(id, newShift);
    return newShift;
  }
  
  async updateShift(id: number, shiftData: Partial<Shift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;
    
    const updatedShift = { ...shift, ...shiftData };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }
  
  async deleteShift(id: number): Promise<boolean> {
    return this.shifts.delete(id);
  }
  
  async getAllShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }
  
  async getShiftsByVenue(venueId: number): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(shift => shift.venueId === venueId);
  }
  
  async getShiftsByEmployee(employeeId: number): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(shift => shift.employeeId === employeeId);
  }
  
  async getShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(shift => {
      const shiftStartTime = new Date(shift.startTime);
      return shiftStartTime >= startDate && shiftStartTime <= endDate;
    });
  }
  
  // Time entry methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }
  
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.timeEntryIdCounter++;
    const newTimeEntry: TimeEntry = {
      ...timeEntry,
      id,
      createdAt: new Date()
    };
    this.timeEntries.set(id, newTimeEntry);
    return newTimeEntry;
  }
  
  async updateTimeEntry(id: number, timeEntryData: Partial<TimeEntry>): Promise<TimeEntry | undefined> {
    const timeEntry = this.timeEntries.get(id);
    if (!timeEntry) return undefined;
    
    const updatedTimeEntry = { ...timeEntry, ...timeEntryData };
    this.timeEntries.set(id, updatedTimeEntry);
    return updatedTimeEntry;
  }
  
  async getTimeEntriesByEmployee(employeeId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(entry => entry.employeeId === employeeId);
  }
  
  async getTimeEntriesByShift(shiftId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(entry => entry.shiftId === shiftId);
  }
  
  async getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(entry => {
      const clockIn = new Date(entry.clockIn);
      return clockIn >= startDate && clockIn <= endDate;
    });
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      sentAt: new Date(),
      isRead: false
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageData };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => 
      message.senderId === userId || message.receiverId === userId || message.receiverId === null
    );
  }
  
  async getUnreadMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => 
      (message.receiverId === userId || message.receiverId === null) && !message.isRead
    );
  }
  
  // Till verification methods
  async getTillVerification(id: number): Promise<TillVerification | undefined> {
    return this.tillVerifications.get(id);
  }
  
  async createTillVerification(tillVerification: InsertTillVerification): Promise<TillVerification> {
    const id = this.tillVerificationIdCounter++;
    
    // Calculate discrepancy
    const discrepancy = tillVerification.actualAmount - tillVerification.expectedAmount;
    
    const newTillVerification: TillVerification = {
      ...tillVerification,
      id,
      discrepancy,
      createdAt: new Date(),
      verifiedAt: tillVerification.verifiedBy ? new Date() : null
    };
    
    this.tillVerifications.set(id, newTillVerification);
    return newTillVerification;
  }
  
  async updateTillVerification(id: number, data: Partial<TillVerification>): Promise<TillVerification | undefined> {
    const tillVerification = this.tillVerifications.get(id);
    if (!tillVerification) return undefined;
    
    // Recalculate discrepancy if either amount is updated
    let discrepancy = tillVerification.discrepancy;
    const expectedAmount = data.expectedAmount ?? tillVerification.expectedAmount;
    const actualAmount = data.actualAmount ?? tillVerification.actualAmount;
    
    if (data.expectedAmount !== undefined || data.actualAmount !== undefined) {
      discrepancy = actualAmount - expectedAmount;
      data.discrepancy = discrepancy;
    }
    
    // Set verification time if admin is verifying
    if (data.verifiedBy !== undefined && !tillVerification.verifiedAt) {
      data.verifiedAt = new Date();
    }
    
    const updatedTillVerification = { ...tillVerification, ...data };
    this.tillVerifications.set(id, updatedTillVerification);
    return updatedTillVerification;
  }
  
  async getTillVerificationsByShift(shiftId: number): Promise<TillVerification[]> {
    return Array.from(this.tillVerifications.values()).filter(
      verification => verification.shiftId === shiftId
    );
  }
  
  async getTillVerificationsByEmployee(employeeId: number): Promise<TillVerification[]> {
    return Array.from(this.tillVerifications.values()).filter(
      verification => verification.employeeId === employeeId
    );
  }
  
  async getTillVerificationsByDateRange(startDate: Date, endDate: Date): Promise<TillVerification[]> {
    return Array.from(this.tillVerifications.values()).filter(verification => {
      const createdAt = new Date(verification.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });
  }
}

// Export the storage instance
export const storage = new MemStorage();
