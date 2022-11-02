import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Discussion } from 'src/entities/discussion.entity';
import { DiscussionService } from './discussion.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';

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
}
