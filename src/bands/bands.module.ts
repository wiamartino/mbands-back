import { Module } from '@nestjs/common';
import { BandsService } from './bands.service';
import { BandsController } from './bands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Band, Country])],
  controllers: [BandsController],
  providers: [BandsService],
})
export class BandsModule {}
