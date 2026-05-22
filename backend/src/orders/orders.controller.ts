import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: string,
  ) {
    return this.orders.findAll({ search, status, customerId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: { user: { id: string } }) {
    return this.orders.create(dto, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.orders.updateStatus(id, dto, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.orders.cancel(id, req.user.id);
  }
}
