import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { UserResponse, UserRoleResponse } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AppRole } from '../../generated/prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.admin)
  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiResponse({ status: 200, type: [UserResponse] })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: UserResponse })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser('id') currentUserId: string) {
    return this.userService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/roles')
  @ApiOperation({ summary: 'Get roles assigned to a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: [UserRoleResponse] })
  getRoles(@Param('id') id: string) {
    return this.userService.getRoles(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.admin)
  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign a role to a user (admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, type: UserRoleResponse })
  addRole(@Param('id') id: string, @Body() dto: AddRoleDto) {
    return this.userService.addRole(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.admin)
  @Delete(':id/roles/:role')
  @ApiOperation({ summary: 'Remove a role from a user (admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'role', enum: AppRole })
  @ApiResponse({ status: 200, description: 'Role removed' })
  removeRole(@Param('id') id: string, @Param('role') role: AppRole) {
    return this.userService.removeRole(id, role);
  }
}
