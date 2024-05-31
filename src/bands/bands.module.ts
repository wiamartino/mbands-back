import { Module } from '@nestjs/common';
import { BandsService } from './bands.service';
import { BandsController } from './bands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Band])],
  controllers: [BandsController],
  providers: [BandsService],
})
export class BandsModule {}
