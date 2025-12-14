import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Member } from './entities/member.entity';

@Injectable()
export class MembersRepository extends Repository<Member> {
  constructor(private dataSource: DataSource) {
    super(Member, dataSource.createEntityManager());
  }

  /**
   * Find all members with relations
   */
  async findAllWithRelations(skip: number, take: number): Promise<Member[]> {
    return this.find({
      skip,
      take,
      relations: {
        band: {
          country: true,
        },
      },
    });
  }

  /**
   * Find one member with relations
   */
  async findOneWithRelations(id: number): Promise<Member | null> {
    return this.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
          albums: true,
        },
      },
    });
  }

  /**
   * Find members by band
   */
  async findByBand(bandId: number): Promise<Member[]> {
    return this.find({
      where: { band: { id: bandId } },
      relations: ['band'],
      order: { joinDate: 'DESC' },
    });
  }

  /**
   * Find members by instrument
   */
  async findByInstrument(instrument: string): Promise<Member[]> {
    return this.find({
      where: { instrument },
      relations: ['band'],
    });
  }

  /**
   * Search members by name
   */
  async searchByName(pattern: string): Promise<Member[]> {
    return this.createQueryBuilder('member')
      .where('LOWER(member.name) LIKE LOWER(:pattern)', { pattern: `%${pattern}%` })
      .leftJoinAndSelect('member.band', 'band')
      .orderBy('member.name', 'ASC')
      .getMany();
  }

  /**
   * Find active members (current band members)
   */
  async findActive(): Promise<Member[]> {
    return this.createQueryBuilder('member')
      .leftJoinAndSelect('member.band', 'band')
      .where('member.leaveDate IS NULL')
      .orderBy('member.joinDate', 'DESC')
      .getMany();
  }
}

