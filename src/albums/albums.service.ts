import { Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';

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

  async findAll(): Promise<Album[]> {
    return this.albumsRepository.find({
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

  async update(id: number, updateAlbumDto: UpdateAlbumDto) {
    return this.albumsRepository.update(id, updateAlbumDto);
  }

  async remove(id: number): Promise<void> {
    await this.albumsRepository.delete(id);
  }
}
