import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ 
    example: 'Иван Иванов', 
    description: 'Полное имя пользователя',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  fullName?: string;
}
