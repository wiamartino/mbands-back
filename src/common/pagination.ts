import { PaginationQueryDto } from './dto/pagination-query.dto';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function buildPaginationParams(
  pagination?: PaginationQueryDto,
): PaginationParams {
  const page = Math.max(1, pagination?.page ?? 1);
  const limitRaw = pagination?.limit ?? 10;
  const limit = Math.min(Math.max(1, limitRaw), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}
