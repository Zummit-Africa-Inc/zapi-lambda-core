import { BadRequestException, Injectable,  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
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
      //check if category exists
      const category = await this.categoryRepo.findOne({
        where:{id:categoryId},
        relations:{api: true}
      })
     
      //return all apis in the category
      return category.api
      
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
}