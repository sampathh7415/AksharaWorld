import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get()
  findAll(
    @Query('status') status?: PaymentStatus,
    @Query('orderId') orderId?: string,
  ) {
    return this.payments.findAll({ status, orderId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payments.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: { user: { id: string } }) {
    return this.payments.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.payments.update(id, dto, req.user.id);
  }
}
