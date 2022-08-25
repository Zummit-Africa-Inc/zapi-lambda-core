import { ApiProperty } from "@nestjs/swagger"

export class CreateProfileDto {
    @ApiProperty()
    email: string

    @ApiProperty()
    userID: string
}