import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentType {
  SINGLE = 'single',
  BULK = 'bulk',
}

export class CreatePaymentDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'ID отчёта (только для single платежа)',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'ID отчёта должен быть строкой' })
  @IsUUID('4', { message: 'ID отчёта должен быть валидным UUID' })
  reportId?: string;

  @ApiProperty({ 
    example: 'single', 
    description: 'Тип платежа',
    enum: PaymentType 
  })
  @IsEnum(PaymentType, { message: 'Некорректный тип платежа' })
  paymentType: PaymentType;
}
