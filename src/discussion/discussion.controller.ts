import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Discussion } from 'src/entities/discussion.entity';
import { DiscussionService } from './discussion.service';
import { CreateCommentDto } from './dto/add-parent-comment.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Discussion')
@Controller('discussion')
export class DiscussionController {
    constructor(private readonly discussionService: DiscussionService){}

    @Post('')
    @ApiOperation({summary: 'Start a new discussion'})
    async startDiscussion(
        @Body() dto: CreateDiscussionDto
    ): Promise<Ok<Discussion>>{
        const discussion = await this.discussionService.startDiscussion(dto)
        return ZaLaResponse.Ok(discussion, "Discussion started", "201")
    }

    @Get('/:discussionId')
    @ApiOperation({summary: 'Get a single discussion'})
    async getSingleDiscussion(
        @Param('discussionId') discussionId: string
    ): Promise<Ok<Discussion>>{
        const discussion = await this.discussionService.getSingleDisussion(discussionId) 
        return ZaLaResponse.Ok(discussion, '200')
    }

    @Get('')
    @ApiOperation({summary:'Get all discussions'})
    async getAllDiscussions()
    : Promise<Ok<Discussion[]>>{
        const discussions = await this.discussionService.getAllDiscusions()
        return ZaLaResponse.Ok(discussions, '200')
    }

    @Post('comment/:profileId')
    @ApiOperation({summary: 'Create a parent comment'})
    async addParentDiscussion(
        @Param('profileId') profileId: string,
        @Body() dto: CreateCommentDto
    ){
        const parentComment= await this.discussionService.addParentComment(profileId, dto)
        return ZaLaResponse.Ok(parentComment, 'Comment added', '201')
    }

    @Patch('/:profileId/:commentId')
    @ApiOperation({summary: 'Edit a comment'})
    async editComment(
        @Param('profileId') profileId: string,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateCommentDto
    ){
        await this.discussionService.editComment(profileId, commentId, dto)
        return {message: 'Comment edited'}
    }
}
