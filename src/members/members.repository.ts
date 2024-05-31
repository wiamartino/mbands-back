import { Repository, DataSource } from 'typeorm';
import { Member } from './entities/member.entity';

export class MembersRepository extends Repository<Member> {
  constructor(private dataSource: DataSource) {
    super(Member, dataSource.createEntityManager());
  }
}
