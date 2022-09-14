import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Api } from 'src/entities/api.entity';
import { Profile } from 'src/entities/profile.entity';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { createSubscriptionDto } from './dto/create-subscription.dto';
import {configConstant} from '../common/constants/config.constant'
import { ConfigService } from '@nestjs/config';


@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepo: Repository<Subscription>,
        @InjectRepository(Api)
        private readonly apiRepo: Repository<Api>,
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        private jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async subscribe(createSubDto: createSubscriptionDto): Promise<Subscription>{
        const {profileId, apiId} = createSubDto
        try {
            const api = await this.apiRepo.findOne({where:{id:apiId}})
            const profile = await this.profileRepo.findOne({where:{id:profileId}})
            const isSubscribed = profile.subscriptions.includes(apiId)
            if(isSubscribed){
                throw new BadRequestException(
                    ZaLaResponse.BadRequest(
                        "Active Subscription",
                        "User is currently subscribed to this API",
                        "400"
                    )
                )
            }
            if(api && profile){            
                const subscriptionToken = await this.getTokens(apiId, profileId)
                const subPayload = {apiId, profileId, subscriptionToken}
                const userSubscription =  this.subscriptionRepo.create(subPayload)
                const newSub  =await this.subscriptionRepo.save(userSubscription)

                await this.profileRepo.update(profile.id, {
                    subscriptions:[...profile.subscriptions, api.id]
                })

                await this.apiRepo.update(api.id, {
                    subscriptions: [...api.subscriptions, profile.id]
                })
                
            return newSub
            }
            

        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(
                    error.name,
                    error.message,
                    error.errorCode
                )
            )
        }
    }

    async getTokens(apiId: string, profileId: string): Promise<string> {
        const subscriptionToken = await this.jwtService.signAsync(
        {
            profileId,
            apiId,
        },
        { secret: this.configService.get(configConstant.jwt.subSecret), expiresIn: 43200 },
        );
        return  subscriptionToken ;
    }
}
