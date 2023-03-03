import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { ApiRatingDto } from 'src/review/dto/create-api-review.dto';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Review } from './../entities/review.entity';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Request } from 'express';

@ApiTags('Review')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth('access-token')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @IdCheck('apiId')
  @Post(':apiId')
  @ApiOperation({ summary: 'Review an api' })
  async addApiRating(
    @Req() req: Request,
    @Param('apiId') apiId: string,
    @Body() dto: ApiRatingDto,
  ): Promise<Ok<string>> {
    await this.reviewService.addApiRating(req.profileId, apiId, dto);
    return ZaLaResponse.Ok('Api review complete', 'Ok', '201');
  }

  @Public()
  @IdCheck('apiId')
  @Get(':apiId')
  @ApiOperation({ summary: 'Get all reviews of an api' })
  @ApiQuery({
    name: 'query',
    description: 'Paginate query',
    required: false,
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
        limit: { type: 'number', description: 'Limit per page' },
        search: { type: 'string', description: 'Search term' },
        searchBy: { type: 'string', description: 'Search by field' },
      },
    },
  })
  async getAllApiReviewsAndRating(
    @Paginate() query: PaginateQuery,
    @Param('apiId') apiId: string,
  ): Promise<Ok<Paginated<Review>>> {
    const reviews = await this.reviewService.getAllApiReviewsAndRating(
      query,
      apiId,
    );
    return ZaLaResponse.Paginated(reviews, 'Ok', '200');
  }

  @Public()
  @IdCheck('apiId', 'reviewId')
  @Get(':apiId/:reviewId')
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
