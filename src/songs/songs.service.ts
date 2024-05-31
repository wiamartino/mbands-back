import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Song } from './entities/song.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  findAll() {
    return this.songsRepository.find();
  }

  findOne(id: number) {
    return this.songsRepository.findOne({ where: { id } });
  }

  update(id: number, updateSongDto: UpdateSongDto) {
    return this.songsRepository.update(id, updateSongDto);
  }

  async remove(id: number): Promise<void> {
    await this.songsRepository.delete(id);
  }
}
