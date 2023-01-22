import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidCategories } from '../common/enums/invalidCategories.enum';
import { Visibility } from '../common/enums/visibility.enum';
import { ZaLaResponse } from '../common/helpers/response';
import { Api } from '../entities/api.entity';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
  ) {}

  async createNewCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    try {
      const category = await this.categoryRepo.findOne({
        where: { name: createCategoryDto.name },
      });

      if (category) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Existing Value',
            `A category with name ${createCategoryDto.name} already exist`,
            '400',
          ),
        );
      }

      const newCategory = this.categoryRepo.create({
        ...createCategoryDto,
      });
      const savedCategory = await this.categoryRepo.save(newCategory);
      return savedCategory;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }

  async findAllCategory(): Promise<Category[]> {
    try {
      const category = await this.categoryRepo.find({ order: { name: 'ASC' } });
      return category;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }

  async getAllApis(categoryId: string) {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });
      if (category.name.toLowerCase() == 'all')
        return await this.apiRepo.find({
          where: { visibility: Visibility.Public },
        });
      const apis = await this.apiRepo.find({
        where: { categoryId, visibility: Visibility.Public },
      });
      return apis;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async deleteCategory(categoryId: string, generalCateroryId: string) {
    try {
      //move all apis in this category to a general category section
      await this.apiRepo
        .createQueryBuilder()
        .update()
        .set({ categoryId: generalCateroryId })
        .where('categoryId = :categoryId', { categoryId })
        .execute();

      await this.categoryRepo.delete(categoryId);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  /**
   * it gets a list of all the categories that apis can be added to
   * @returns a lis of categories
   */
  async getAllValidCategories(): Promise<Category[]> {
    try {
      const categories = await this.categoryRepo.find();
      const invalidCategories = Object.values(InvalidCategories);

      // loop through categories list and invalid categories list
      invalidCategories.forEach((invalidCategory) => {
        categories.forEach((category) => {
          // remove category if it can be found in the invalid categories enum
          if (invalidCategory === category.name) {
            const index = categories.indexOf(category);
            categories.splice(index, 1);
          }
        });
      });
      return categories;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }
}
