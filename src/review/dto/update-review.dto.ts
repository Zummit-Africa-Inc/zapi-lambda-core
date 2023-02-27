import { PartialType } from '@nestjs/swagger';
import { ApiRatingDto } from './create-api-review.dto';

export class UpdateReviewDto extends PartialType(ApiRatingDto) {}
