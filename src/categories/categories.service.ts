import { BadRequestException, Injectable,  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidCategories } from 'src/common/enums/invalidCategories.enum';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Api } from 'src/entities/api.entity';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
  ) {}

  async createNewCategory(createCategoryDto: CreateCategoryDto):Promise<Category> {
    try{
      const category = await this.categoryRepo.findOne({
        where: { name: createCategoryDto.name},
      })

      if(category) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Existing Value',
            `A category with name ${createCategoryDto.name} already exist`,
            '400'
          )
        )
      }

      const newCategory = this.categoryRepo.create({
        ...createCategoryDto,
      });
      const savedCategory = await this.categoryRepo.save(newCategory);
      return savedCategory;
    }
    catch(err){
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status)
      )
    }
  }

  async findAllCategory(): Promise<Category[]> {
    try{
      const category = await this.categoryRepo.find()
      return category;
    }
    catch(err){
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status)
      )
    }
  }


  async getAllApis(categoryId: string){
    try {
      const apis = await this.apiRepo.find({where:{categoryId: categoryId}})     
      return apis
      
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          error.status
        )
      )
    }
  }

  async deleteCategory(categoryId: string, generalCateroryId: string){
    try {
      //move all apis in this category to a general category section
      await this.apiRepo.createQueryBuilder()
        .update()
        .set({categoryId: generalCateroryId})
        .where('categoryId = :categoryId', {categoryId})
        .execute()

      await this.categoryRepo.delete(categoryId)
      
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          error.status
        )
      )
    }
  }

  /**
   * it gets a list of all the categories that apis can be added to
   * @returns a lis of categories
   */
  async getAllValidCategories(): Promise<Category[]>{
    try{
      const categories = await this.categoryRepo.find()
      const invalidCategories = Object.values(InvalidCategories)
      
      // loop through categories list and invalid categories list
      invalidCategories.forEach(invalidCategory=>{
        categories.forEach(category=>{
          // remove category if it can be found in the invalid categories enum 
          if(invalidCategory === category.name){
            const index = categories.indexOf(category)
            categories.splice(index, 1)
          }
        })
      })
      return categories
    }
    catch(err){
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status)
      )
    }
  }

  /**
   * 
   * @param categoryId - category id to be updated
   * @param dto - update category dto
   */
  async updateCategory(categoryId: string, dto : UpdateCategoryDto): Promise<void>{
    try {
      await this.categoryRepo.update(categoryId, dto)
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status)
      )
    }
  }
}