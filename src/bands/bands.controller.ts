import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bands')
@UseGuards(JwtAuthGuard)
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @Post()
  async create(@Body() createBandDto: CreateBandDto) {
    return this.bandsService.create(createBandDto);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.bandsService.findAll(+page, +limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const band = await this.bandsService.findOne(+id);
    if (!band) {
      throw new NotFoundException('Band not found');
    }
    return band;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBandDto: UpdateBandDto) {
    return this.bandsService.update(+id, updateBandDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bandsService.remove(+id);
  }

  @Get('search/:name')
  async searchByName(@Param('name') name: string) {
    return this.bandsService.searchByName(name);
  }

  @Get('lists/:firstLetter')
  async searchByFirstLetter(@Param('firstLetter') firstLetter: string) {
    return this.bandsService.searchByFirstLetter(firstLetter);
  }

  @Get('genre/:genre')
  async findByGenre(@Param('genre') genre: string) {
    return this.bandsService.findByGenre(genre);
  }

  @Get('year/:year')
  async findByYear(@Param('year') year: number) {
    if (!year || isNaN(year)) {
      throw new NotFoundException('Year parameter is missing or invalid');
    }
    return this.bandsService.findByYear(+year);
  }

  @Get('country/:country')
  async findByCountry(@Param('country') country: string) {
    return this.bandsService.findByCountry(country);
  }
}
