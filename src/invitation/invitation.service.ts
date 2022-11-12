import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import {Invitation} from '../entities/invitation.entity'
import {Profile} from '../entities/profile.entity'
import {Api} from '../entities/api.entity'
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { configConstant } from '../common/constants/config.constant';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
    private jwTokenService: JwtService,
    private readonly configService: ConfigService,
    @Inject('NOTIFY_SERVICE') private readonly n_client: ClientProxy,

  ){}
  async createInvitation(createInvitationDto: CreateInvitationDto, apiId: string) {
    try {

      const api = await this.apiRepo.findOne({where:{id:apiId}})

      //Check if there is an existing invitation to this email yet to be accepted
      const existingInvite = await this.invitationRepo.findOne({
        where:{
          inviteeEmail: createInvitationDto.inviteeEmail,
          apiAuthor: api.profileId
        }
      })
      

      let verify: Object
      let newInvite: Object
      const invitationSecret = process.env.INVITATION_SECRET
      const invitationExpiry = process.env.INVITATION_EXPIRY
      const invitee = await this.profileRepo.findOne({where:{email: createInvitationDto.inviteeEmail}})

      if(!invitee){
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            "Not Found Error",
            "User with provided email not found",
            "404"
          )
        )
      }
      const jwtPayload = {
        apiAuthorId: api.profileId,
        inviteeId: invitee.id
      }
      const token = await this.jwTokenService.signAsync(
        jwtPayload, {secret: invitationSecret, expiresIn: invitationExpiry}
      )
      
      if (existingInvite){
       verify = this.jwTokenService.verify(existingInvite.token,{secret: invitationSecret})
       if(!verify){
            newInvite = await this.invitationRepo.create({
            apiAuthor: api.profileId,
            inviteeEmail: invitee.email,
            inviteeId: invitee.id,
            token: token

          })
        }
      }
      const coreBaseUrl = this.configService.get<string>(configConstant.baseUrls.coreService)
      const acceptUrl = `${coreBaseUrl}/invitation/accept/${api.id}/${invitee.id}`
      const body = `
      <h1>Hello ${invitee.email},</h1>
      <h2> You have been invited to be a contributor to the ${api.name} API </h2>
      <a href=${acceptUrl}> Click Here To Accept Invite</a>
      `
      const mailData = {
        email: invitee.email,
        subject: `Invitation to Become A Contributor To An API`,
        html: body
      }
      await this.sendMail('mail', mailData)
      return `Invitation sent successfully to ${invitee.email}`

    } catch (error) {
      console.log(error);  
 
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server Error',
            'Something went wrong',
            '500',
          ),
        );
      // }
    }
  }

  async acceptInvitation(inviteeId: string, apiId: string) {
    try {

      const api = await this.apiRepo.findOne({where:{id:apiId}})

     //Check if the invitation still exists
      const existingInvite = await this.invitationRepo.findOne({
        where:{
          inviteeId,
          apiId: api.id
        }
      })

      if(!existingInvite){
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            "Not Found Error",
            "Invitation not Found on server",
            "404"
          )
        )
      }
      
      const invitationSecret = process.env.INVITATION_SECRET
      const contributors = api.contributors

      //Check if the invitation has not expired
      const verify = await this.jwTokenService.verify(existingInvite.token,{secret: invitationSecret})
      contributors.push(verify.inviteeId)
      
      await this.apiRepo.update(
        api.id,
        {contributors: contributors},

      )
      //Delete the invitation after it has been accepted
      this.invitationRepo.delete(existingInvite.id)

      return 'Invitation Accepted Successfully'
    } catch (error) {
      console.log(error);  
       if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Subscription Error',
            "Invitation already expired",
            '403',
          ),
        );
      } else {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server Error',
            'Something went wrong',
            '500',
          ),
        );
      }
    }
  }

  async getallInvitations( apiId: string) {
    try {
      const allInvites = await this.invitationRepo.find({where:{apiId: apiId}})
     
      return allInvites
    } catch (error) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server Error',
            'Something went wrong',
            '500',
          ),
        );
    }
  }


  async sendMail(pattern: string, payload: object): Promise<void> {
      try {
        this.n_client.emit(pattern, payload);
      } catch (error) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
        );
      }
  }

}
