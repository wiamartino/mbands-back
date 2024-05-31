import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

@Controller('bands')
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @Post()
  async create(@Body() createBandDto: CreateBandDto) {
    return this.bandsService.create(createBandDto);
  }

  @Get()
  async findAll() {
    return this.bandsService.findAll();
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
}
