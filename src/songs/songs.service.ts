import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Song } from './entities/song.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';
import { idempotentSoftDelete } from '../common/soft-delete';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songsRepository: Repository<Song>,
  ) {}
  create(createSongDto: CreateSongDto) {
    const newSong = this.songsRepository.create(createSongDto);
    return this.songsRepository.save(newSong);
  }

  async findAll(pagination?: PaginationQueryDto) {
    const { skip, take } = buildPaginationParams(pagination);

    return this.songsRepository.find({
      skip,
      take,
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: {
        band: {
          country: true,
        },
        albums: {
          band: true,
        },
      },
    });
  }

  findOne(id: number) {
    return this.songsRepository.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
        },
        albums: {
          band: true,
        },
      },
    });
  }

  update(id: number, updateSongDto: UpdateSongDto) {
    return this.songsRepository.update(id, updateSongDto);
  }

  async remove(id: number): Promise<UpdateResult> {
    return idempotentSoftDelete(this.songsRepository, id);
  }
}
