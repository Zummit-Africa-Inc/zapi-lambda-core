import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';

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

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
