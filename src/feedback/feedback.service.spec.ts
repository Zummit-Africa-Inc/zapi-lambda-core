import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockType,
  repositoryMockFactory,
} from '../common/helpers/test.helpers';
import { Feedback } from '../entities/feedback.entity';
import { Repository } from 'typeorm';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackEnum } from '../common/enums/feedback.enum';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let feedbackRepo: MockType<Repository<Feedback>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(Feedback),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    service = module.get<FeedbackService>(FeedbackService);
    feedbackRepo = module.get(getRepositoryToken(Feedback));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feedback', async () => {
      expect(service.create).toBeDefined();
      try {
        const createFeedbackDto: CreateFeedbackDto = {
          name: 'Test Feedback',
          email: 'test@gmail.com',
          body: 'This is the body of the feedback',
          title: `What's it now`,
          category: FeedbackEnum.Feedback,
        };
        expect(feedbackRepo.create).toHaveBeenCalledWith(createFeedbackDto);
        expect(feedbackRepo.create).toEqual(createFeedbackDto);
      } catch (error) {}
    });
  });

  describe('findAll', () => {
    it('should return a list of feedback', async () => {
      expect(service.findAll).toBeDefined();
      try {
        feedbackRepo.find();
        expect(service.findAll()).toReturnWith([Feedback]);
      } catch (error) {}
    });
  });
});
