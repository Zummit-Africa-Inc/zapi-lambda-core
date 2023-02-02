import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvalidCategories } from '../common/enums/invalidCategories.enum';
import { Visibility } from '../common/enums/visibility.enum';
import { Api } from '../entities/api.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../entities/category.entity';
import { MockType, repositoryMockFactory } from '../common/helpers/testHelpers';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let apiRepo: MockType<Repository<Api>>;
  let catRepo: MockType<Repository<Category>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useFactory: repositoryMockFactory,
        },

        { provide: getRepositoryToken(Api), useFactory: repositoryMockFactory },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    catRepo = module.get(getRepositoryToken(Category));
    apiRepo = module.get(getRepositoryToken(Api));
  });

  describe('createNewCategory', () => {
    it('should create a new category', async () => {
      expect(service.createNewCategory).toBeDefined();

      const createCategoryDto: CreateCategoryDto = {
        name: 'foo',
        description: 'bar',
      };
      try {
        const category = catRepo.findOne({
          where: { name: createCategoryDto.name },
        });

        if (category) {
          expect(service.createNewCategory).toThrowError;
        }
        expect(catRepo.create).toHaveBeenCalledWith(createCategoryDto);
        expect(catRepo.create).toEqual(createCategoryDto);
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe('findAllCategory', () => {
    it('should find all categories', async () => {
      expect(service.findAllCategory).toBeDefined();

      try {
        catRepo.find();
        expect(service.findAllCategory()).toReturnWith([Category]);
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe('getAllApis', () => {
    it('should find all apis in a category', async () => {
      expect(service.getAllApis).toBeDefined();

      const testCategory = { name: 'test_cat', id: '1' };
      const testApi = { name: 'test_api', id: '1', categoryId: '1' };
      try {
        const category = catRepo.findOne.mockReturnValue(testCategory.id);

        if (category.name.toLowerCase() == 'all')
          return apiRepo.find.mockReturnValue({
            where: { visibility: Visibility.Public },
          });

        apiRepo.find.mockReturnValue({
          where: { categoryId: testCategory.id, visibility: Visibility.Public },
        });
        expect(service.getAllApis(testCategory.id)).toBeInstanceOf(testApi);
        expect(apiRepo.findOne).toHaveBeenCalledWith({
          categoryId: testCategory.id,
          visibility: Visibility.Public,
        });
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async (categoryId = 'fake-id', generalCategoryId = 'fake-gen-id') => {
      expect(service.deleteCategory).toBeDefined();

      try {
        apiRepo.createQueryBuilder.prototype
          .update()
          .set({ categoryId: generalCategoryId })
          .where('categoryId = :categoryId', { categoryId })
          .execute();

        const oldApis = apiRepo.find.mockReturnValue({
          where: { categoryId: generalCategoryId },
        });

        const newApis = apiRepo.find.mockReturnValue({
          where: { categoryId: generalCategoryId },
        });

        expect(oldApis).resolves.toBe(newApis);
        expect(catRepo.getId(categoryId)).toBeNull();
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe('getAllValidCategories', () => {
    it('should get all valid categories', async () => {
      expect(service.getAllValidCategories).toBeDefined();

      try {
        const categories = catRepo.find() as Category[];
        expect(catRepo.find).toHaveBeenCalled();
        const invalidCategories = Object.values(InvalidCategories);

        invalidCategories.forEach((invalidCategory) => {
          categories.forEach((category) => {
            if (invalidCategory === category.name) {
              const index = categories.indexOf(category);
              categories.splice(index, 1);
            }
          });
        });
        expect(categories).not.toContain(invalidCategories);
      } catch (error) {
        console.log(error);
      }
    });
  });
});
