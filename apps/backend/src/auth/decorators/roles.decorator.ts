import { SetMetadata } from '@nestjs/common';
import { AppRole } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
