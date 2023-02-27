import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { ApiRatingDto } from 'src/review/dto/create-api-review.dto';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Review } from './../entities/review.entity';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Apis')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth('access-token')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Public() // to be removed later
  @IdCheck('apiId', 'profileId')
  @Post(':apiId/:profileId')
  @ApiOperation({ summary: 'Rate an api' })
  async addApiRating(
    @Param('profileId') profileId: string,
    @Param('apiId') apiId: string,
    @Body() dto: ApiRatingDto,
  ): Promise<Ok<string>> {
    await this.reviewService.addApiRating(profileId, apiId, dto);
    return ZaLaResponse.Ok('Api rating complete', 'Ok', '201');
  }

  // @Public()
  // @IdCheck('apiId')
  // @Get('/reviews/:apiId')
  // @ApiOperation({ summary: 'Get all reviews of an api' })
  // async getAllApiReviewsAndRating(
  //   @Paginate() query: PaginateQuery,
  //   @Param('apiId') apiId: string,
  // ): Promise<Ok<Paginated<Review>>> {
  //   const reviews = await this.reviewService.getAllApiReviewsAndRating(
  //     query,
  //     apiId,
  //   );
  //   return ZaLaResponse.Paginated(reviews, 'Ok', '200');
  // }

  @Public()
  @IdCheck('apiId', 'reviewId')
  @Get('/reviews/:apiId/:reviewId')
  @ApiOperation({ summary: 'Get a single review of an api' })
  async getSingleApiReviewsAndRating(
    @Param('apiId') apiId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<Ok<Review>> {
    const review = await this.reviewService.getSingleApiReviewsAndRating(
      apiId,
      reviewId,
    );
    return ZaLaResponse.Ok(review, 'Ok', '200');
  }
}
