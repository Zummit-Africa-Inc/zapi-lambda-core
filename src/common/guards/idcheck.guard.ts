import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Api } from 'src/entities/api.entity';
import { Category } from 'src/entities/category.entity';
import { Comment } from 'src/entities/comments.entity';
import { Discussion } from 'src/entities/discussion.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Pricing } from 'src/entities/pricingPlan.entity';
import { Profile } from 'src/entities/profile.entity';
import { Review } from 'src/entities/review.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from '../helpers/response';
const validate = require('uuid-validate');

@Injectable()
export class IdCheckGuard implements CanActivate {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(Api)
    private apiRepo: Repository<Api>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Endpoint)
    private endpointRepo: Repository<Endpoint>,
    @InjectRepository(Pricing)
    private pricingRepo: Repository<Pricing>,
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(Discussion)
    private discussionRepo: Repository<Discussion>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    private reflector: Reflector,
  ) {}

  //  save repository in corresponding id keys into an object
  repo = {
    profileId: this.profileRepo,
    apiId: this.apiRepo,
    categoryId: this.categoryRepo,
    endpointId: this.endpointRepo,
    pricingId: this.pricingRepo,
    subscriptionId: this.subRepo,
    commentId: this.commentRepo,
    discussionId: this.discussionRepo,
    reviewId: this.reviewRepo,
  };

  async canActivate(context: ExecutionContext) {
    try {
      const requiredId = this.reflector.get<string[]>(
        'id',
        context.getHandler(),
      );
      const request = context.switchToHttp().getRequest();
      for (let index in requiredId) {
        const idValue = request.params[`${requiredId[index]}`];
        if (!idValue) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'bad request',
              `${requiredId[index]} is not provided as params`,
              '400',
            ),
          );
        }
        if (!validate(idValue)) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'bad request',
              `${requiredId[index]} is not provided as type uuid`,
              '400',
            ),
          );
        }
        const objDetail = await this.repo[`${requiredId[index]}`].findOne({
          where: { id: idValue },
        });
        if (!objDetail) {
          throw new NotFoundException(
            ZaLaResponse.NotFoundRequest(
              'Not Found',
              `${requiredId[index]} does not exist`,
              '404',
            ),
          );
        }
      }
      return true;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
