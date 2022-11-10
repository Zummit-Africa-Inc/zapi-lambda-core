import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import {Invitation} from '../entities/invitation.entity'
import {Profile} from '../entities/profile.entity'
import {Api} from '../entities/api.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Api,
      Profile,
      Invitation
    ]),
    JwtModule.register({ publicKey: 'PUBLIC_KEY', privateKey: 'PRIVATE_KEY' }),
    ConfigModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService]
})
export class InvitationModule {}
