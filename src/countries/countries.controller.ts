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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.countriesService.findAll(+page, +limit);
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
