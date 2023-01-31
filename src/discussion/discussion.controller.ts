import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Discussion } from 'src/entities/discussion.entity';
import { DiscussionService } from './discussion.service';
import { CommentDto } from './dto/comment.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { Request } from 'express';

@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@ApiTags('Discussions')
@Controller('discussion')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post('')
  @ApiOperation({ summary: 'Start a new discussion' })
  async startDiscussion(
    @Body() dto: CreateDiscussionDto,
  ): Promise<Ok<Discussion>> {
    const discussion = await this.discussionService.startDiscussion(dto);
    return ZaLaResponse.Ok(discussion, 'Discussion started', '201');
  }

  @IdCheck('discussionId')
  @Get('/:discussionId')
  @ApiOperation({ summary: 'Gets a discussion and all its comments' })
  async getSingleDiscussion(
    @Param('discussionId') discussionId: string,
  ): Promise<Ok<Object>> {
    const discussion =
      await this.discussionService.getSingleDisussionAndComments(discussionId);
    return ZaLaResponse.Ok(discussion, 'Ok', '200');
  }

  @Public()
  @Get('/api/all')
  @ApiOperation({ summary: 'Get all discussions of an api' })
  async getAllDiscussions(
    @Paginate() query: PaginateQuery,
  ): Promise<Ok<Paginated<Discussion>>> {
    const discussions = await this.discussionService.getAllDiscusionsOfAnApi(
      query,
    );
    return ZaLaResponse.Paginated(discussions, 'Ok', '200');
  }

  @IdCheck('discussionId', 'profileId')
  @Post('/comment/:discussionId/:profileId')
  @ApiOperation({ summary: 'Comment under a discussion' })
  async addComment(
    @Param('discussionId') discussionId: string,
    @Param('profileId') profileId: string,
    @Body() dto: CommentDto,
  ) {
    const comment = await this.discussionService.addComment(
      discussionId,
      profileId,
      dto,
    );
    return ZaLaResponse.Ok(comment, 'Ok', '201');
  }

  @Get('/get/user-discussions')
  @ApiOperation({ summary: "Get all user's discussions" })
  async getUserDiscussions(@Req() req: Request): Promise<Ok<Discussion[]>> {
    const discussions = await this.discussionService.getUserDiscussions(
      req.profileId,
    );
    return ZaLaResponse.Ok(discussions, 'Ok', '200');
  }

  @IdCheck('commentId', 'profileId')
  @Patch('/comment/:commentId/:profileId')
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Param('profileId') profileId: string,
    @Body() dto: CommentDto,
  ) {
    await this.discussionService.updateComment(commentId, profileId, dto);
    return ZaLaResponse.Ok('Comment updated', 'Ok', '200');
  }
}
