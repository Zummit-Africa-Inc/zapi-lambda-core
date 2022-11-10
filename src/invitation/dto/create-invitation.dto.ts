import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
export class CreateInvitationDto {
    @ApiProperty()
    @IsString()
    inviteeEmail: string;

}
