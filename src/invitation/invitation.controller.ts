import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZaLaResponse, Ok } from 'src/common/helpers/response';
import { Invitation } from 'src/entities/invitation.entity';


@ApiTags('Api-Invitation')

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('/invite/:apiId')
  @ApiOperation({ summary: 'Send Email Invite' })
  async createInvite(
    @Body() createInvitationDto: CreateInvitationDto,
    @Param('apiId') apiId: string 
    ): Promise<Ok<String>> {
    const invite = await this.invitationService.createInvitation(createInvitationDto, apiId);
    return ZaLaResponse.Ok(invite, 'Invite created', 201)
  }

  @Get('/accept/:apiId/:inviteeId')
  @ApiOperation({ summary: 'Accept Email Invite' })
  async acceptInvite(
    @Param('apiId') apiId: string,
    @Param('inviteeId') inviteeId: string 

    ): Promise<Ok<String>> {
    const invite = await this.invitationService.acceptInvitation(inviteeId, apiId);
    return ZaLaResponse.Ok(invite, 'Invite accepted', 200)
  }

  @Get('/get-all/:apiId')
  @ApiOperation({ summary: 'Send Email Invite' })
  async getAllInvite(
    @Param('apiId') apiId: string,
    ): Promise<Ok<Invitation[]>> {
    const invites = await this.invitationService.getallInvitations( apiId);
    return ZaLaResponse.Ok(invites, 'Invites retrieved successfully', 200)
  }

}
