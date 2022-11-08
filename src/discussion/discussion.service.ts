import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Comment } from 'src/entities/comments.entity';
import { Discussion } from 'src/entities/discussion.entity';
import { Repository } from 'typeorm';
import { CommentDto } from './dto/comment.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';

@Injectable()
export class DiscussionService {
    constructor(
        @InjectRepository(Discussion)
        private readonly discussionRepo: Repository<Discussion>,
        @InjectRepository(Comment)
        private readonly commentRepo: Repository<Comment>
    ){}

    async startDiscussion(dto: CreateDiscussionDto): Promise<Discussion>{
        try {
            return await this.discussionRepo.save(dto)
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async getSingleDisussionAndComments(disucssionId: string): Promise<Object>{
        try { 
            const discussion = await this.discussionRepo.findOne({where: {id: disucssionId}})

            const comments = []

            for(let i = 0; i <= discussion.comments.length; i++){
                const comment = await this.commentRepo.findOne({where:{id: comments[i]}})
                comments.push(comment)
            }

            // object to hold discussion and comments
            const discussionAndComments = {
                discussion: discussion,
                comments: comments
            }

            return discussionAndComments

        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async getAllDiscusionsOfAnApi(apiId: string): Promise<Discussion[]>{
        try {
            return await this.discussionRepo.find({where:{api_id: apiId}})
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async addComment(discussionId: string, profileId: string, dto: CommentDto): Promise<Comment>{
        try {
            // create comment object and save to db
            const comment = await this.commentRepo.create({
                discussion_id: discussionId,
                profile_id: profileId,
                ...dto
            })
            const savedComment = await this.commentRepo.save(comment) 

            // save comment to discussion
            const discussion = await this.discussionRepo.findOne({where:{id: discussionId}})
            discussion.comments.push(savedComment.id)
            await this.discussionRepo.save(discussion)

            return savedComment

        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )   
        }
    }

    async updateComment(commentId: string, profileId: string, dto: CommentDto){
        try {
            const comment = await this.commentRepo.findOne({where:{id: commentId}})
            if(comment.profile_id != profileId){
                throw new BadRequestException(
                    ZaLaResponse.BadRequest(
                        'Unauthorized request',
                        'You can only edit a comment that belongs to you', 
                        '401')
                )  
            }

            return await this.commentRepo.update(commentId, dto)
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )  
        }
    }
}
