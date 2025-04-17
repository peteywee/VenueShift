import { Request, Response, NextFunction } from "express";
import { User, UserRole, Permissions, PermissionType, RolePermissions, UserRoleType } from "@shared/schema";

type CastType<T> = T extends Array<infer U> ? Array<U> : T;

/**
 * Check if a user has a specific permission
 * @param user User object
 * @param permission Permission to check
 * @returns boolean indicating if user has permission
 */
export function hasPermission(user: User, permission: PermissionType): boolean {
  // Super admin has all permissions
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Check role-based permissions
  const rolePermissions = RolePermissions[user.role as UserRoleType] || [];
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Check user-specific permissions
  const userPermissions = (user.permissions as PermissionType[] || []);
  return userPermissions.includes(permission);
}

/**
 * Check if user has permission to access a specific venue
 * @param user User object
 * @param venueId Venue ID to check access for
 * @returns boolean indicating if user has venue access
 */
export function hasVenueAccess(user: User, venueId: number): boolean {
  // Super admin, admin, and IT have access to all venues
  if (
    user.role === UserRole.SUPER_ADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.IT
  ) {
    return true;
  }

  // Check if venue is in user's assigned venues
  const userVenues = (user.assignedVenues as number[] || []);
  return userVenues.includes(venueId);
}

/**
 * Middleware to check if user has a specific permission
 * @param permission Permission to check
 * @returns Express middleware
 */
export function requirePermission(permission: PermissionType) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as User;
    if (!hasPermission(user, permission)) {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to perform this action"
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has access to a specific venue
 * @param venueIdParam Name of the parameter containing venue ID
 * @returns Express middleware
 */
export function requireVenueAccess(venueIdParam: string = "venueId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as User;
    
    // Get venueId from params, query, or body
    const venueId = 
      parseInt(req.params[venueIdParam]) || 
      parseInt(req.query[venueIdParam] as string) || 
      req.body[venueIdParam];
    
    if (!venueId) {
      return next(); // No venue ID to check
    }

    if (!hasVenueAccess(user, venueId)) {
      return res.status(403).json({
        message: "Forbidden: You don't have access to this venue"
      });
    }

    next();
  };
}

/**
 * Middleware for actions that can only be performed by administrators
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as User;
  if (
    user.role !== UserRole.SUPER_ADMIN && 
    user.role !== UserRole.ADMIN && 
    user.role !== UserRole.IT
  ) {
    return res.status(403).json({ 
      message: "Forbidden: Administrator privileges required" 
    });
  }
  
  next();
}

/**
 * Middleware for actions that can only be performed by super administrators
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as User;
  if (user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ 
      message: "Forbidden: Owner privileges required" 
    });
  }
  
  next();
}

/**
 * Middleware to ensure users can only see or modify their own data
 * @param userIdParam Name of the parameter containing user ID
 * @param allowRoles Roles that bypass this check
 * @returns Express middleware
 */
export function requireSelfOrPermission(
  userIdParam: string = "userId",
  permission: PermissionType
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as User;
    
    // Get userId from params, query, or body
    const userId = 
      parseInt(req.params[userIdParam]) || 
      parseInt(req.query[userIdParam] as string) || 
      req.body[userIdParam];
    
    if (!userId) {
      return next(); // No user ID to check
    }

    // Allow if it's the same user
    if (user.id === userId) {
      return next();
    }

    // Otherwise check permission
    if (!hasPermission(user, permission)) {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to perform this action"
      });
    }
    
    next();
  };
}