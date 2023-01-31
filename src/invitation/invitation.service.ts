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
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

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
    private readonly httpService: HttpService

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
      const currentContributors = api.contributors

      if (currentContributors.includes(invitee.id)){
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            "Bad Request Error",
            "User already a contributor to this API",
            "400"
          )
        )
      }
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
      
      verify = existingInvite? this.jwTokenService.verify(existingInvite.token,{secret: invitationSecret}) : null

      if(!verify){
        newInvite = this.invitationRepo.create({
        apiId: api.id,
        apiAuthor: api.profileId,
        inviteeEmail: invitee.email,
        inviteeId: invitee.id,
        token: token
        })
        await this.invitationRepo.save(newInvite)
      } else if(verify){
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            "Bad Request Error",
            "A Pending Invitation exists for this user",
            "400"
          )
        )
      }  
     
      await this.invitationRepo.save(newInvite)

      const coreBaseUrl = this.configService.get<string>(configConstant.baseUrls.coreService)
      const acceptUrl = `${coreBaseUrl}/api/v1/invitation/accept/${api.id}/${invitee.id}`

      const rawText = `Hello ${invitee.email}, \n
      You have been invited to be a contributor to the ${api.name} API \n
        Click The Link Below To Accept Invite: \n${acceptUrl}
      `
      const mailData = {
        email: invitee.email,
        subject: `Invitation to Become A Contributor To An API`,
        text: rawText,
      }
      // await this.sendMail('mail', mailData)
      await this.sendMailByAxios(mailData)
      return `Invitation sent successfully to ${invitee.email}`

    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.response.error||'Internal Server Error',
          error.response.message||'Something went wrong',
          error.response.errorCode||'500',
        ),
      );
    }
  }

  async acceptInvitation(inviteeId: string, apiId: string) {
    try {

      const api = await this.apiRepo.findOne({where:{id:apiId}})

     //Check if the invitation still exists
      const existingInvite = await this.invitationRepo.findOne({
        where:{
          inviteeId: inviteeId,
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

      const apiAuthor = await this.profileRepo.findOne({where:{id: api.profileId}})
      
      const invitationSecret = process.env.INVITATION_SECRET
      const contributors = api.contributors

      //Check if the invitation has not expired
      const verify = await this.jwTokenService.verify(existingInvite.token,{secret: invitationSecret})
      contributors.push(verify.inviteeId)

      const textBody = `
      Hello ${apiAuthor.email}, \n
      ${existingInvite.inviteeEmail} has accepted your request to be a contributor to your API: \n
      ${String(api.name).toUpperCase()}, \n Check your api contributors for confirmation.
      `
      const mailData = {
        email: apiAuthor.email,
        subject: `API contributor Request Response`,
        text: textBody,
      }

      // Send mail by rabbitMQ
      // await this.sendMail('mail', mailData)

      //Sending mail via axios
      await this.sendMailByAxios( mailData)

      await this.apiRepo.update(
        api.id,
        {contributors: contributors},

      )
      //Delete the invitation after it has been accepted
      this.invitationRepo.delete(existingInvite.id)

      return 'Invitation Accepted Successfully'
    } catch (error) {
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
            error.response.error||'Internal Server Error',
            error.response.message||'Something went wrong',
            error.response.errorCode||'500',
          ),
        );
      }
    }
  }

  async getallInvitations( apiId: string) {
    try {
      let pendingInvites = []
      const allInvites = await this.invitationRepo.find({where:{apiId: apiId}})
      if(allInvites.length < 1){
        return pendingInvites
      } else{
        return allInvites
      }

    } catch (error) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            error.response.error||'Internal Server Error',
            error.response.message||'Something went wrong',
            error.response.errorCode||'500',
          ),
        );
    }
  }


  async sendMail(pattern: string, payload: object): Promise<void> {
      try {
        this.n_client.emit(pattern, payload);
      } catch (error) {
        throw new BadRequestException(
           ZaLaResponse.BadRequest(
            error.response.error||'Internal Server Error',
            error.response.message||'Something went wrong',
            error.response.errorCode||'500',
          ),
        );
      }
  }
  async sendMailByAxios(payload: object): Promise<any> {
    try {
      const mailUrl = this.configService.get(configConstant.baseUrls.notificationServiceMailSendingUrl)
      const axRef =  this.httpService.axiosRef
      const mailResponse = await axRef({
        method: "post",
        url: mailUrl,
        data: payload,
        //  headers: { 'X-Zapi-Proxy-Secret': uniqueApiSecurityKey },
      })
      if(mailResponse.status >= 400){
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            "mail sending Error",
            mailResponse.statusText,
            (mailResponse.status).toString()
          )
        )
      }
      const data = mailResponse.data

      return data
    } catch (error) {
      throw new BadRequestException(
          ZaLaResponse.BadRequest(
          error.response.error||'Internal Server Error',
          error.response.message||'Something went wrong',
          error.response.errorCode||'500',
        ),
      );
    }
  }
}
