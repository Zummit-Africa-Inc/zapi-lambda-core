import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Comments } from 'src/entities/comments.entity';
import { Discussion } from 'src/entities/discussion.entity';
import { Repository } from 'typeorm';
import { CreateDiscussionDto } from './dto/create-discussion.dto';

@Injectable()
export class DiscussionService {
    constructor(
        @InjectRepository(Discussion)
        private readonly discussionRepo: Repository<Discussion>,
        @InjectRepository(Comments)
        private readonly commentRepo: Repository<Comments>
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

    async getAllDiscusions(): Promise<Discussion[]>{
        try {
            return await this.discussionRepo.find()
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(error.name, error.message, error.status)
            )
        }
    }

    async addParentComment(){}

    async addChildComment(){}

    async editComment(){}

    async getParentComment(){}
}
