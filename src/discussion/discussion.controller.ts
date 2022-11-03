import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Discussion } from 'src/entities/discussion.entity';
import { DiscussionService } from './discussion.service';
import { CreateChildCommentDto } from './dto/add-child-comment.dto';
import { CreateParentCommentDto } from './dto/add-parent-comment.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Discussions')
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

    @IdCheck('discussionId')
    @Get('/:discussionId')
    @ApiOperation({summary: 'Get a single discussion'})
    async getSingleDiscussion(
        @Param('discussionId') discussionId: string
    ): Promise<Ok<Discussion>>{
        const discussion = await this.discussionService.getSingleDisussion(discussionId) 
        return ZaLaResponse.Ok(discussion,'Ok','200')
    }

    @Get('')
    @ApiOperation({summary:'Get all discussions'})
    async getAllDiscussions()
    : Promise<Ok<Discussion[]>>{
        const discussions = await this.discussionService.getAllDiscusions()
        return ZaLaResponse.Ok(discussions, 'Ok', '200')
    }

    @IdCheck('profileId')
    @Post('comment/:profileId')
    @ApiOperation({summary: 'Create a parent comment'})
    async addParentDiscussion(
        @Param('profileId') profileId: string,
        @Body() dto: CreateParentCommentDto
    ){
        const parentComment= await this.discussionService.addParentComment(profileId, dto)
        return ZaLaResponse.Ok(parentComment, 'Comment added', '201')
    }

    @IdCheck('profileId','commentId')
    @Patch('/:profileId/:commentId')
    @ApiOperation({summary: 'Edit a comment'})
    async editComment(
        @Param('profileId') profileId: string,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateCommentDto
    ){
        await this.discussionService.editComment(profileId, commentId, dto)
        return ZaLaResponse.Ok('Comment updated', 'Ok','200')
    }

    @IdCheck('profileId','commentId')
    @Post('/child-comment/:profileId/:commentId')
    @ApiOperation({summary:'Add a child comment to a parent comment'})
    async addChildComment(
        @Param('profileId') profileId: string,
        @Param('commentId') commentId: string,
        @Body() dto: CreateChildCommentDto
    ){
        const childComment = await this.discussionService.addChildComment(profileId, commentId, dto)
        return ZaLaResponse.Ok(childComment, 'Ok', '201')
    }

    @IdCheck('commentId')
    @Get('comments/:commentId')
    @ApiOperation({summary: 'Get a parent comment and all its child comments'})
    async getParentComment(
        @Param('commentId') commentId: string
    ){
        const comments = await this.discussionService.getParentAndChildComments(commentId)
        return ZaLaResponse.Ok(comments, 'Ok','200')
    }
}
