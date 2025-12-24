import { ConflictException, NotFoundException } from '@nestjs/common';
import { IsNull, Repository, UpdateResult } from 'typeorm';

type DeletableEntity = {
  id: number;
  deletedAt?: Date | null;
  version?: number;
};

/**
 * Performs an idempotent, race-safe soft delete.
 * - If the entity does not exist, throws NotFound
 * - If already soft-deleted, returns a no-op UpdateResult
 * - Otherwise updates deletedAt with an optimistic version check when available
 */
export async function idempotentSoftDelete<T extends DeletableEntity>(
  repo: Repository<T>,
  id: number,
): Promise<UpdateResult> {
  const entity = await repo.findOne({
    where: { id } as any,
    withDeleted: true,
    // select minimal fields; cast to any to avoid generic keyof constraints
    select: ['id', 'deletedAt', 'version'] as any,
  });

  if (!entity) {
    throw new NotFoundException('Resource not found');
  }

  if (entity.deletedAt) {
    // Idempotent delete: treat as success without modifying
    return { affected: 0, generatedMaps: [], raw: [] } as UpdateResult;
  }

  const where: any = { id, deletedAt: IsNull() };
  if (typeof entity.version === 'number') {
    where.version = entity.version;
  }

  const result = await repo.update(where, { deletedAt: new Date() } as any);
  if (result.affected === 0) {
    // Another process may have updated/deleted the row meanwhile
    throw new ConflictException(
      'Resource was modified or deleted by another process. Please refresh and try again.',
    );
  }
  return result;
}
