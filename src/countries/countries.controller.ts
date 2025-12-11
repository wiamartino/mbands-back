import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('countries')
@UseGuards(JwtAuthGuard)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationQueryDto = new PaginationQueryDto(),
  ) {
    return this.countriesService.findAll(pagination);
  }

  @Get('search/name/:name')
  findByName(@Param('name') name: string) {
    return this.countriesService.findByName(name);
  }

  @Get('search/region/:region')
  findByRegion(@Param('region') region: string) {
    return this.countriesService.findByRegion(region);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.countriesService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.remove(id);
  }

  @Patch(':id/deactivate')
  softRemove(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.softRemove(id);
  }
}
