import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Console } from 'console';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Comment } from 'src/entities/comments.entity';
import { Discussion } from 'src/entities/discussion.entity';
import { Repository } from 'typeorm';
import { CreateChildCommentDto } from './dto/add-child-comment.dto';
import { CreateParentCommentDto } from './dto/add-parent-comment.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

    async getSingleDisussion(disucssionId: string): Promise<Discussion>{
        try {
            return await this.discussionRepo.findOne({where: {id: disucssionId}})
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

    async addParentComment(profileId : string, dto: CreateParentCommentDto): Promise<Comment>{
        try {
            const parentComment = await this.commentRepo.create({
                ...dto,
                is_parent: true,
                profile_id: profileId,
            })

            return await this.commentRepo.save(parentComment)
            
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async addChildComment(profileId: string, parentCommentId: string, dto: CreateChildCommentDto): Promise<Comment>{
        try {
            //check if comment is a parent comment
            const isParentComment = await this.commentRepo.findOne({where:{id: parentCommentId}})
            if(isParentComment.is_parent != true){
                throw new BadRequestException(
                    ZaLaResponse.BadRequest('You cannot only add a comment to a parent comment', '400')
                )
            }

            const childCommentObj = await this.commentRepo.create({
                ...dto,
                profile_id: profileId   
            })
            
            const childComment = await this.commentRepo.save(childCommentObj) 

            //update parent comment
            isParentComment.child_comment_ids.push(childComment.id)
            await this.commentRepo.save(isParentComment)
            
            return childComment

        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async editComment(profileId: string, commentId: string, dto: UpdateCommentDto): Promise<void>{
        try {
            const comment = await this.commentRepo.findOne({where:{id: commentId}})
            if(profileId !== comment.profile_id){
                throw new BadRequestException(
                    ZaLaResponse.BadRequest(
                        'Unauthorized request',
                        'You can only edit a comment that belongs to you', 
                        '401')
                )
            }
            await this.commentRepo.update(commentId, dto)
            
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async getParentAndChildComments(parentCommentId: string):Promise<Comment[]>{
        try {
            const comments = []
            const parentComment = await this.commentRepo.findOne({where:{id:parentCommentId}})
            comments.push(parentComment)

            const childComments = parentComment.child_comment_ids

            for(let comment = 0; comment <= childComments.length - 1; comment++){
                const childComment = await this.commentRepo.findOne({where:{id: childComments[comment]}})
                comments.push(childComment)
            }
            
            return comments
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )   
        }
    }
}
