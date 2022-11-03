import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateChildCommentDto{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    body: string

}