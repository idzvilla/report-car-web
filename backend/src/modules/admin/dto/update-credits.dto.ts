import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCreditsDto {
  @ApiProperty({ 
    example: 100, 
    description: 'Количество credits для установки' 
  })
  @IsNumber({}, { message: 'Credits должны быть числом' })
  @Min(0, { message: 'Credits не могут быть отрицательными' })
  credits: number;
}
