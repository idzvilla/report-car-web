import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestReportDto {
  @ApiProperty({ 
    example: '1HGBH41JXMN109186', 
    description: 'VIN номер автомобиля (17 символов)' 
  })
  @IsString({ message: 'VIN должен быть строкой' })
  @Length(17, 17, { message: 'VIN должен содержать ровно 17 символов' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, { 
    message: 'VIN должен содержать только буквы и цифры (кроме I, O, Q)' 
  })
  vin: string;
}
