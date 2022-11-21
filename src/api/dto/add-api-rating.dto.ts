import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
export class ApiRatingDto {
    @ApiPropertyOptional()
    @IsString()
    review? : string

    @ApiProperty()
    @IsNotEmpty()
    @Min(1, {message: "You cannot rate an api less than 1"})
    @Max(5, {message: 'You cannot rate an api more than 5'})
    rating: number

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    reviewer: string 
}
