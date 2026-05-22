import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  findAll(
    @Req() req: { user: { id: string } },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notifications.findAll(req.user.id, unreadOnly === 'true');
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notifications.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  markAllRead(@Req() req: { user: { id: string } }) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateNotificationDto) {
    return this.notifications.create(dto);
  }
}
