import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { ApiRatingDto } from 'src/review/dto/create-api-review.dto';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Api } from 'src/entities/api.entity';
import { Profile } from 'src/entities/profile.entity';
import { Review } from 'src/entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}
  /**
   * allows the user to review and rate an api
   * @param profileId : id of the profile making a request to update an api
   * @param apiId : id of the api to be updated
   * @param dto : api update dto
   */
  async addApiRating(
    profileId: string,
    apiId: string,
    dto: ApiRatingDto,
  ): Promise<void> {
    try {
      // Ensure api owner cannot post a review
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      if (api.profileId === profileId) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server error',
            'You cannot rate your own api',
            '500',
          ),
        );
      }

      // Ensure user cannot rate an api twice
      const reviewAlreadyExists = await this.reviewRepo.findOne({
        where: { api_id: apiId, profile_id: profileId },
      });
      if (reviewAlreadyExists) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server error',
            'You cannot rate an api twice',
            '500',
          ),
        );
      }

      // Get email from the provided profileId to populate the `reviewer` field
      const reviewer = await this.profileRepo.findOne({
        where: { id: profileId },
      });

      // Create api rating object
      const apiRating = this.reviewRepo.create({
        profile_id: profileId,
        api_id: apiId,
        reviewer: reviewer.email,
        rating: dto.rating,
      });

      // Save api rating
      await this.reviewRepo.save(apiRating);

      // Calculate api rating
      const reviews = await this.reviewRepo.find({ where: { api_id: apiId } });
      let ratingsTotal = 0;

      reviews.forEach((review) => {
        ratingsTotal += review.rating;
      });

      const overallRating = (ratingsTotal / reviews.length) * 2;

      // Update api rating
      await this.apiRepo.update(apiId, { rating: overallRating });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  async getAllApiReviewsAndRating(query: PaginateQuery, apiId: string) {
    try {
      return paginate(query, this.reviewRepo, {
        sortableColumns: ['createdOn', 'name', 'visibility'],
        searchableColumns: ['name', 'description', 'about', 'visibility'],
        defaultSortBy: [['id', 'DESC']],
        where: { visibility: Visibility.Public },
        filterableColumns: {
          category: [FilterOperator.IN],
          status: [FilterOperator.IN],
          rating: [FilterOperator.GTE, FilterOperator.LTE],
        },
      });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  async getSingleApiReviewsAndRating(apiId: string, reviewId: string) {
    try {
      const review = await this.reviewRepo.find({
        where: { api_id: apiId, id: reviewId },
      });
      return review;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
