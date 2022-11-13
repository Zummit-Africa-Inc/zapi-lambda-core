import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Max, Min } from "class-validator";
export class ApiRatingDto {
    @ApiProperty()
    @IsString()
    review: string

    @ApiProperty()
    @IsNotEmpty()
    @Min(1, {message: "You cannot rate an api less than 1"})
    @Max(5, {message: 'You cannot rate an api more than 5'})
    rating: number
}
