import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CommentDto{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    body: string
}