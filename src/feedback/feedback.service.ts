import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './../entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
  ) {}

  async create(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    try {
      const newFeedback = this.feedbackRepo.create({
        ...createFeedbackDto,
      });
      const savedFeedback = await this.feedbackRepo.save(newFeedback);
      return savedFeedback;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }

  async findAll(): Promise<Feedback[]> {
    try {
      return await this.feedbackRepo.find();
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }
}
