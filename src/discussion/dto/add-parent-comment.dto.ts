import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateCommentDto{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    body: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    discussion_id: string 
}