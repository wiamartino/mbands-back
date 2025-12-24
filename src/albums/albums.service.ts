import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';
import { idempotentSoftDelete } from '../common/soft-delete';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private readonly albumsRepository: Repository<Album>,
  ) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const band = this.albumsRepository.create(createAlbumDto);
    return this.albumsRepository.save(band);
  }

  async findAll(pagination?: PaginationQueryDto): Promise<Album[]> {
    const { skip, take } = buildPaginationParams(pagination);

    return this.albumsRepository.find({
      skip,
      take,
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: {
        band: true,
        songs: true,
      },
    });
  }

  async findOne(id: number): Promise<Album> {
    return this.albumsRepository.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
        },
        songs: {
          band: true,
        },
      },
    });
  }

  async findByBandId(bandId: number): Promise<Album[]> {
    return this.albumsRepository.find({
      where: { band: { id: bandId } },
      relations: {
        band: true,
        songs: true,
      },
    });
  }

  async update(id: number, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const album = await this.albumsRepository.findOne({ where: { id } });
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    try {
      // Optimistic locking: TypeORM will check version automatically
      const result = await this.albumsRepository.update(
        { id, version: album.version },
        updateAlbumDto,
      );

      if (result.affected === 0) {
        throw new ConflictException(
          'Album was modified by another user. Please refresh and try again.',
        );
      }

      return this.findOne(id);
    } catch (error: any) {
      if (error.message?.includes('version') || error.code === '23505') {
        throw new ConflictException(
          'Album was modified by another user. Please refresh and try again.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    return idempotentSoftDelete(this.albumsRepository, id);
  }
}
