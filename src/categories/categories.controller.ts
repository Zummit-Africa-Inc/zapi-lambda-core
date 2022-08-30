import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ZaLaResponse } from '../common/helpers/response';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post('/create')
  @ApiOperation({summary: 'Create a new category'})
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryService.createNewCategory(createCategoryDto);
    return ZaLaResponse.Ok(category, 'Category created', '201')
  }

  @Get()
  @ApiOperation({summary: 'Get all available category'})
  async findAll(){
    const allCategories = this.categoryService.findAllCategory();
    return ZaLaResponse.Ok(allCategories, 'Ok', '200')
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
