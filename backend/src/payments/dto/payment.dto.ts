import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentStatus, PaymentProvider } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @IsOptional()
  @IsString()
  providerRef?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  refundStatus?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsString()
  providerRef?: string;
}
