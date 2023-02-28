import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
export class ApiRatingDto {
  @ApiPropertyOptional()
  review?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'You cannot rate an api less than 1' })
  @Max(5, { message: 'You cannot rate an api more than 5' })
  rating: number;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // reviewer: string
}
