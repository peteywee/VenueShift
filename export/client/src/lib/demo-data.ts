import { Message, User, Venue, Shift, TimeEntry, TillVerification } from "@shared/schema";

// Demo users
export const demoUsers: User[] = [
  {
    id: 1,
    username: "demo_admin",
    password: "demo_password", // Not real, just for display
    fullName: "Alex Johnson",
    email: "alex@shiftsync.org",
    role: "admin",
    profilePicture: "https://ui-avatars.com/api/?name=AJ&background=0D8ABC&color=fff",
    phone: "555-123-4567",
    assignedVenues: [1, 2, 3],
    permissions: [],
    active: true,
    lastLogin: new Date().toISOString(),
    createdById: null,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    username: "sarah.manager",
    password: "manager123", // Not real, just for display
    fullName: "Sarah Martinez",
    email: "sarah@shiftsync.org",
    role: "manager",
    profilePicture: "https://ui-avatars.com/api/?name=SM&background=6941C6&color=fff",
    phone: "555-234-5678",
    assignedVenues: [1],
    permissions: [],
    active: true,
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 1,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    username: "james.supervisor",
    password: "super456", // Not real, just for display
    fullName: "James Wilson",
    email: "james@shiftsync.org",
    role: "supervisor",
    profilePicture: "https://ui-avatars.com/api/?name=JW&background=15803D&color=fff",
    phone: "555-345-6789",
    assignedVenues: [2],
    permissions: [],
    active: true,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 1,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    username: "emily.cashier",
    password: "cash789", // Not real, just for display
    fullName: "Emily Rodriguez",
    email: "emily@shiftsync.org",
    role: "employee",
    profilePicture: "https://ui-avatars.com/api/?name=ER&background=DE3163&color=fff",
    phone: "555-456-7890",
    assignedVenues: [1],
    permissions: [],
    active: true,
    lastLogin: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    username: "michael.employee",
    password: "empl123", // Not real, just for display
    fullName: "Michael Chen",
    email: "michael@shiftsync.org",
    role: "employee",
    profilePicture: "https://ui-avatars.com/api/?name=MC&background=FF7F50&color=fff",
    phone: "555-567-8901",
    assignedVenues: [2],
    permissions: [],
    active: true,
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 3,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo venues
export const demoVenues: Venue[] = [
  {
    id: 1,
    name: "Downtown Center",
    address: "123 Main Street, Metropolis, NY 10001",
    description: "Primary location in the city center with high traffic",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: "West Side Location",
    address: "456 West Avenue, Metropolis, NY 10002",
    description: "Newer location in the growing west side neighborhood",
    coordinates: { lat: 40.7218, lng: -74.0181 },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: "East Branch",
    address: "789 East Boulevard, Metropolis, NY 10003",
    description: "Smaller branch serving the east side community",
    coordinates: { lat: 40.7214, lng: -73.9972 },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo messages for the messaging feature
export const demoMessages: Message[] = [
  // Announcement messages (receiverId is null)
  {
    id: 1,
    senderId: 1, // Admin
    receiverId: null, // Announcement to everyone
    content: "Welcome to our new ShiftSync platform! This system will make it easier to manage shifts, track time, and communicate with your team.",
    isRead: true,
    sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    senderId: 1, // Admin
    receiverId: null, // Announcement to everyone
    content: "Reminder: All staff meeting this Friday at 9:00 AM. We'll be discussing the upcoming schedule changes and summer event preparations.",
    isRead: true,
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    senderId: 1, // Admin
    receiverId: null, // Announcement to everyone
    content: "Important: New health and safety protocols will be implemented starting next week. Please review the documentation shared via email.",
    isRead: false,
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Direct messages between users
  // Admin (1) and Manager (2) conversation
  {
    id: 4,
    senderId: 1, // Admin
    receiverId: 2, // Manager
    content: "Sarah, could you please cover the Downtown Center this weekend? We're expecting higher than usual traffic due to the festival.",
    isRead: true,
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    senderId: 2, // Manager
    receiverId: 1, // Admin
    content: "Of course, Alex. I'll adjust my schedule. Should I ask Emily to come in as well?",
    isRead: true,
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    senderId: 1, // Admin
    receiverId: 2, // Manager
    content: "Yes, that would be great. We'll need at least two people at the register during peak hours.",
    isRead: true,
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
  },
  {
    id: 7,
    senderId: 2, // Manager
    receiverId: 1, // Admin
    content: "I've talked to Emily and she's available. I'll update the schedule in the system.",
    isRead: true,
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 8,
    senderId: 1, // Admin
    receiverId: 2, // Manager
    content: "Perfect, thank you! Also, we need to finalize the staff rotation for next month. Can we meet tomorrow?",
    isRead: false,
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },

  // Admin (1) and Supervisor (3) conversation
  {
    id: 9,
    senderId: 3, // Supervisor
    receiverId: 1, // Admin
    content: "Hi Alex, the new equipment for the West Side location has arrived. Should I schedule training for the staff this week?",
    isRead: true,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 10,
    senderId: 1, // Admin
    receiverId: 3, // Supervisor
    content: "That's great news, James! Yes, please organize a training session. Maybe Thursday afternoon when it's usually slower?",
    isRead: true,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 11,
    senderId: 3, // Supervisor
    receiverId: 1, // Admin
    content: "Thursday works well. I'll set it up for 2-4pm and notify the team. Should we record the session for those who can't attend?",
    isRead: true,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 12,
    senderId: 1, // Admin
    receiverId: 3, // Supervisor
    content: "Good thinking. Yes, please record it and make it available in our training library.",
    isRead: true,
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Employee (4) to Manager (2)
  {
    id: 13,
    senderId: 4, // Employee
    receiverId: 2, // Manager
    content: "Hi Sarah, I wanted to let you know that I completed the inventory check as requested. Everything matches except for two items that I've noted in the system.",
    isRead: true,
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 14,
    senderId: 2, // Manager
    receiverId: 4, // Employee
    content: "Thanks Emily! I saw your notes. Great job on being thorough. I'll follow up on those discrepancies.",
    isRead: true,
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 15,
    senderId: 4, // Employee
    receiverId: 2, // Manager
    content: "Sarah, just wanted to confirm I'm scheduled for the Downtown Center this weekend as discussed?",
    isRead: true,
    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 16,
    senderId: 2, // Manager
    receiverId: 4, // Employee
    content: "Yes, you're on the schedule for Saturday 10am-6pm and Sunday 12pm-8pm. Thanks for checking!",
    isRead: false,
    sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },

  // Recent message - unread
  {
    id: 17,
    senderId: 5, // Employee
    receiverId: 1, // Admin
    content: "Hello Alex, I noticed the scheduling system shows me working at both locations next Tuesday. I think there might be an overlap in my shifts.",
    isRead: false,
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

// Demo shifts for scheduling
export const demoShifts: Shift[] = [
  // Current day shifts
  {
    id: 1,
    venueId: 1, // Downtown Center
    employeeId: 4, // Emily
    startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    title: "Morning Register",
    status: "confirmed",
    notes: "Cover main register during morning rush",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    venueId: 1, // Downtown Center
    employeeId: 2, // Sarah (Manager)
    startTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    title: "Manager Shift",
    status: "confirmed",
    notes: "Oversee operations and closing",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    venueId: 2, // West Side Location
    employeeId: 5, // Michael
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    title: "General Operations",
    status: "confirmed",
    notes: "",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    venueId: 2, // West Side Location
    employeeId: 3, // James (Supervisor)
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
    title: "Closing Supervisor",
    status: "confirmed",
    notes: "Staff training at 2pm",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Tomorrow's shifts
  {
    id: 5,
    venueId: 1, // Downtown Center
    employeeId: 4, // Emily
    startTime: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow.toISOString();
    })(),
    endTime: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);
      return tomorrow.toISOString();
    })(),
    title: "Morning Register",
    status: "confirmed",
    notes: "",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    venueId: 3, // East Branch
    employeeId: 5, // Michael
    startTime: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      return tomorrow.toISOString();
    })(),
    endTime: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      return tomorrow.toISOString();
    })(),
    title: "General Operations",
    status: "confirmed",
    notes: "Inventory count scheduled",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Weekend shifts
  {
    id: 7,
    venueId: 1, // Downtown Center
    employeeId: 4, // Emily
    startTime: (() => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()) % 7 + 1);
      saturday.setHours(10, 0, 0, 0);
      return saturday.toISOString();
    })(),
    endTime: (() => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()) % 7 + 1);
      saturday.setHours(18, 0, 0, 0);
      return saturday.toISOString();
    })(),
    title: "Weekend Shift",
    status: "confirmed",
    notes: "Festival weekend - expect high traffic",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 8,
    venueId: 1, // Downtown Center
    employeeId: 2, // Sarah (Manager)
    startTime: (() => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()) % 7 + 1);
      saturday.setHours(10, 0, 0, 0);
      return saturday.toISOString();
    })(),
    endTime: (() => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()) % 7 + 1);
      saturday.setHours(18, 0, 0, 0);
      return saturday.toISOString();
    })(),
    title: "Weekend Manager",
    status: "confirmed",
    notes: "Festival weekend supervision",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 9,
    venueId: 1, // Downtown Center
    employeeId: 4, // Emily
    startTime: (() => {
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()) % 7 + 1);
      sunday.setHours(12, 0, 0, 0);
      return sunday.toISOString();
    })(),
    endTime: (() => {
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()) % 7 + 1);
      sunday.setHours(20, 0, 0, 0);
      return sunday.toISOString();
    })(),
    title: "Sunday Evening",
    status: "confirmed",
    notes: "Close register and prepare end-of-week reports",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo time entries
export const demoTimeEntries: TimeEntry[] = [
  // Today's clock-ins
  {
    id: 1,
    employeeId: 4, // Emily
    shiftId: 1,
    clockIn: new Date(new Date().setHours(8, 58, 0, 0)).toISOString(),
    clockOut: null,
    totalHours: null,
    notes: "Arrived early to prepare register",
    createdAt: new Date(new Date().setHours(8, 58, 0, 0)).toISOString()
  },
  {
    id: 2,
    employeeId: 2, // Sarah (Manager)
    shiftId: 2,
    clockIn: new Date(new Date().setHours(11, 55, 0, 0)).toISOString(),
    clockOut: null,
    totalHours: null,
    notes: "",
    createdAt: new Date(new Date().setHours(11, 55, 0, 0)).toISOString()
  },
  {
    id: 3,
    employeeId: 5, // Michael
    shiftId: 3,
    clockIn: new Date(new Date().setHours(10, 5, 0, 0)).toISOString(),
    clockOut: null,
    totalHours: null,
    notes: "",
    createdAt: new Date(new Date().setHours(10, 5, 0, 0)).toISOString()
  },
  
  // Previous day entries (completed shifts)
  {
    id: 4,
    employeeId: 4, // Emily
    shiftId: null,
    clockIn: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(9, 0, 0, 0);
      return yesterday.toISOString();
    })(),
    clockOut: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(17, 5, 0, 0);
      return yesterday.toISOString();
    })(),
    totalHours: 8.08,
    notes: "",
    createdAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(9, 0, 0, 0);
      return yesterday.toISOString();
    })()
  },
  {
    id: 5,
    employeeId: 5, // Michael
    shiftId: null,
    clockIn: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);
      return yesterday.toISOString();
    })(),
    clockOut: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(18, 0, 0, 0);
      return yesterday.toISOString();
    })(),
    totalHours: 8.0,
    notes: "",
    createdAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);
      return yesterday.toISOString();
    })()
  },
  {
    id: 6,
    employeeId: 3, // James (Supervisor)
    shiftId: null,
    clockIn: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(14, 0, 0, 0);
      return yesterday.toISOString();
    })(),
    clockOut: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(22, 15, 0, 0);
      return yesterday.toISOString();
    })(),
    totalHours: 8.25,
    notes: "Stayed late to resolve register discrepancy",
    createdAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(14, 0, 0, 0);
      return yesterday.toISOString();
    })()
  }
];

// Demo till verifications
export const demoTillVerifications: (TillVerification & {
  status?: string;
  venueId?: number;
})[] = [
  {
    id: 1,
    shiftId: 11,
    employeeId: 4, // Emily
    venueId: 1, // Downtown Center (for demo presentation only)
    expectedAmount: 124550, // cents (1245.50)
    actualAmount: 125075, // cents (1250.75)
    discrepancy: 525, // cents (5.25)
    notes: "Minor positive discrepancy. Extra change not properly recorded. Till balanced within acceptable range.",
    verifiedBy: 2, // Sarah (Manager) verified
    status: "verified", // for demo UI purposes
    verifiedAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString();
    })(),
    createdAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(17, 15, 0, 0);
      return yesterday.toISOString();
    })()
  },
  {
    id: 2,
    shiftId: 12,
    employeeId: 5, // Michael
    venueId: 2, // West Side Location (for demo presentation only)
    expectedAmount: 88000, // cents (880.00)
    actualAmount: 87525, // cents (875.25)
    discrepancy: -475, // cents (-4.75)
    notes: "Small negative discrepancy. Possible incorrect change given. Within acceptable range.",
    verifiedBy: 3, // James (Supervisor) verified
    status: "verified", // for demo UI purposes
    verifiedAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString();
    })(),
    createdAt: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(18, 10, 0, 0);
      return yesterday.toISOString();
    })()
  },
  {
    id: 3,
    shiftId: 13,
    employeeId: 4, // Emily
    venueId: 1, // Downtown Center (for demo presentation only)
    expectedAmount: 95000, // cents (950.00)
    actualAmount: 95000, // cents (950.00)
    discrepancy: 0, // cents (0.00)
    notes: "Perfect balance. No discrepancy.",
    verifiedBy: 2, // Sarah (Manager) verified
    status: "verified", // for demo UI purposes
    verifiedAt: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      return date.toISOString();
    })(),
    createdAt: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      date.setHours(17, 5, 0, 0);
      return date.toISOString();
    })()
  },
  {
    id: 4,
    shiftId: 14,
    employeeId: 3, // James (Supervisor)
    venueId: 2, // West Side Location (for demo presentation only)
    expectedAmount: 149575, // cents (1495.75)
    actualAmount: 152035, // cents (1520.35)
    discrepancy: 2460, // cents (24.60)
    notes: "Larger discrepancy than usual. Potential error in recorded transactions. Requires follow-up with accounting.",
    verifiedBy: 1, // Alex (Admin) verified
    status: "flagged", // for demo UI purposes
    verifiedAt: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      return date.toISOString();
    })(),
    createdAt: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      date.setHours(22, 20, 0, 0);
      return date.toISOString();
    })()
  },
  {
    id: 5,
    shiftId: 15,
    employeeId: 5, // Michael
    venueId: 3, // East Branch (for demo presentation only)
    expectedAmount: 78825, // cents (788.25)
    actualAmount: 78550, // cents (785.50)
    discrepancy: -275, // cents (-2.75)
    notes: "Minor discrepancy. Rounding errors in multiple transactions. No action needed.",
    verifiedBy: 1, // Alex (Admin) verified
    status: "verified", // for demo UI purposes
    verifiedAt: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 4);
      return date.toISOString();
    })(),
    createdAt: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 4);
      date.setHours(18, 30, 0, 0);
      return date.toISOString();
    })()
  }
];