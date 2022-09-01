import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo : Repository<Category>) {}

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  findAll() {
    return `This action returns all categories`;
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

  async getAllApis(categoryId: string){
    //check if category exists
    const categoryExists = await this.categoryRepo.findOne({where:{id:categoryId}})
    if(!categoryExists){
      throw ZaLaResponse.NotFoundRequest(
        "Not found",
        "Category not found",
        "404"
      )
    }
    //return all apis in the category
    return categoryExists.api
  }
}