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

  @Post()
  @ApiOperation({ summary: 'Start a new discussion' })
  async startDiscussion(
    @Body() dto: CreateDiscussionDto,
    @Req() req: Request,
  ): Promise<Ok<Discussion>> {
    const discussion = await this.discussionService.startDiscussion(
      dto,
      req.profileId,
    );
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
  4;
  @Get('/get/user-discussions')
  @ApiOperation({ summary: "Get all user's discussions" })
  async getUserDiscussions(@Req() req: Request): Promise<Ok<Discussion[]>> {
    const discussions = await this.discussionService.getUserDiscussions(
      req.profileId,
    );
    return ZaLaResponse.Ok(discussions, 'Ok', '200');
  }

  @Public()
  @IdCheck('apiId')
  @Get('/api/:apiId')
  @ApiOperation({ summary: 'Get all discussions of an api' })
  async getAllDiscussions(
    @Param('apiId') apiId: string,
  ): Promise<Ok<Discussion[]>> {
    const discussions = await this.discussionService.getAllDiscusionsOfAnApi(
      apiId,
    );
    return ZaLaResponse.Ok(discussions, 'Ok', '200');
  }

  @IdCheck('discussionId')
  @Post('comment/:discussionId')
  @ApiOperation({ summary: 'Comment under a discussion' })
  async addComment(
    @Param('discussionId') discussionId: string,
    @Req() req: Request,
    @Body() dto: CommentDto,
  ) {
    const comment = await this.discussionService.addComment(
      discussionId,
      req.profileId,
      dto,
    );
    return ZaLaResponse.Ok(comment, 'Ok', '201');
  }

  @IdCheck('commentId')
  @Patch('comment/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Req() req: Request,
    @Body() dto: CommentDto,
  ) {
    await this.discussionService.updateComment(commentId, req.profileId, dto);
    return ZaLaResponse.Ok('Comment updated', 'Ok', '200');
  }
}
