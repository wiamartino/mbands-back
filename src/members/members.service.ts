import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) { }
  async create(createMemberDto: CreateMemberDto) {
    const band = this.membersRepository.create(createMemberDto);
    return this.membersRepository.save(band);
  }

  async findAll() {
    return this.membersRepository.find({
      relations: {
        band: {
          country: true,
          albums: true,
        },
      },
    });
  }

  async findOne(id: number) {
    return this.membersRepository.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
          albums: true,
        },
      },
    });
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    await this.membersRepository.update(id, updateMemberDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<UpdateResult> {
    return this.membersRepository.softDelete(id);
  }
}
