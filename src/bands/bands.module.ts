import { Module } from '@nestjs/common';
import { BandsService } from './bands.service';
import { BandsController } from './bands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { BandsRepository } from './bands.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Band, Country])],
  controllers: [BandsController],
  providers: [BandsService, BandsRepository],
  exports: [BandsRepository],
})
export class BandsModule {}
