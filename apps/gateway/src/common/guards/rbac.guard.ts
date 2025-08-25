import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Role {
  Owner = 'Owner',
  Admin = 'Admin',
  Quant = 'Quant',
  Strategist = 'Strategist',
  Risk = 'Risk',
  Compliance = 'Compliance',
  Viewer = 'Viewer',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `User with role '${user.role}' is not authorized to access this resource. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [Role.Owner]: [Role.Owner, Role.Admin, Role.Quant, Role.Strategist, Role.Risk, Role.Compliance, Role.Viewer],
  [Role.Admin]: [Role.Admin, Role.Quant, Role.Strategist, Role.Risk, Role.Compliance, Role.Viewer],
  [Role.Quant]: [Role.Quant, Role.Viewer],
  [Role.Strategist]: [Role.Strategist, Role.Viewer],
  [Role.Risk]: [Role.Risk, Role.Viewer],
  [Role.Compliance]: [Role.Compliance, Role.Viewer],
  [Role.Viewer]: [Role.Viewer],
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
}
