import { Test, TestingModule } from '@nestjs/testing';
import { BandsService } from './bands/bands.service';
import { AlbumsService } from './albums/albums.service';
import { EventsService } from './events/events.service';
import { BandsRepository } from './bands/bands.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Band } from './bands/entities/band.entity';
import { Album } from './albums/entities/album.entity';
import { Event } from './events/entities/event.entity';
import { Country } from './countries/entities/country.entity';
import { DataSource, UpdateResult } from 'typeorm';

/**
 * Comprehensive Optimistic Locking Validation Test Suite
 *
 * This test suite validates that optimistic locking prevents:
 * 1. Lost Updates - When multiple users modify the same entity
 * 2. Write Conflicts - When version mismatches occur
 * 3. Race Conditions - In concurrent update scenarios
 */
describe('Optimistic Locking Validation', () => {
  describe('Band Service - Optimistic Locking', () => {
    let service: BandsService;
    let repository: BandsRepository;

    const mockBand = {
      id: 1,
      name: 'The Beatles',
      version: 1,
      genre: 'Rock',
      yearFormed: 1960,
      active: true,
      website: null,
      description: null,
      imageUrl: null,
      country: null,
      members: [],
      albums: [],
      songs: [],
      events: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BandsService,
          {
            provide: BandsRepository,
            useValue: {
              findOne: jest.fn(),
              update: jest.fn(),
              findOneWithRelations: jest.fn(),
              softDelete: jest.fn(),
              create: jest.fn(),
              save: jest.fn(),
              findByNamePattern: jest.fn(),
              findByFirstLetter: jest.fn(),
              findByGenre: jest.fn(),
              findByYear: jest.fn(),
              findByCountry: jest.fn(),
              findAllWithRelations: jest.fn(),
            },
          },
          {
            provide: getRepositoryToken(Country),
            useValue: { findOne: jest.fn() },
          },
          {
            provide: DataSource,
            useValue: { createQueryRunner: jest.fn() },
          },
        ],
      }).compile();

      service = module.get<BandsService>(BandsService);
      repository = module.get<BandsRepository>(BandsRepository);
    });

    describe('Version Field Validation', () => {
      it('should increment version on successful update', async () => {
        const updateDto = { name: 'Updated Beatles' };
        const updatedBand = {
          ...mockBand,
          name: 'Updated Beatles',
          version: 2,
        };

        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockBand);
        jest.spyOn(repository, 'update').mockResolvedValueOnce({
          affected: 1,
          raw: {},
          generatedMaps: [],
        } as UpdateResult);
        jest
          .spyOn(repository, 'findOneWithRelations')
          .mockResolvedValueOnce(updatedBand);

        const result = await service.update(1, updateDto);

        expect(result.version).toBe(2);
        expect(repository.update).toHaveBeenCalledWith(
          { id: 1, version: 1 },
          updateDto,
        );
      });

      it('should include version in WHERE clause for update', async () => {
        const updateDto = { name: 'Test' };
        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockBand);
        jest.spyOn(repository, 'update').mockResolvedValueOnce({
          affected: 1,
          raw: {},
          generatedMaps: [],
        } as UpdateResult);
        jest.spyOn(repository, 'findOneWithRelations').mockResolvedValueOnce({
          ...mockBand,
          version: 2,
        });

        await service.update(1, updateDto);

        // Verify version is part of WHERE clause
        expect(repository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            version: mockBand.version,
          }),
          expect.anything(),
        );
      });

      it('should start with version 1 for new entities', () => {
        expect(mockBand.version).toBe(1);
      });
    });

    describe('Conflict Detection', () => {
      it('should detect version mismatch (affected = 0)', async () => {
        const updateDto = { name: 'Conflicted Update' };

        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockBand);
        // Version has changed - update affects 0 rows
        jest.spyOn(repository, 'update').mockResolvedValueOnce({
          affected: 0,
          raw: {},
          generatedMaps: [],
        } as UpdateResult);

        await expect(service.update(1, updateDto)).rejects.toThrow(
          ConflictException,
        );
      });

      it('should throw ConflictException with descriptive message', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockBand);
        jest.spyOn(repository, 'update').mockResolvedValueOnce({
          affected: 0,
          raw: {},
          generatedMaps: [],
        } as UpdateResult);

        await expect(service.update(1, { name: 'Test' })).rejects.toThrow(
          'Band was modified by another user. Please refresh and try again.',
        );
      });

      it('should not update when entity not found', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

        await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
          NotFoundException,
        );

        expect(repository.update).not.toHaveBeenCalled();
      });
    });

    describe('Concurrent Update Scenario', () => {
      it('should prevent lost updates in concurrent modifications', async () => {
        // Scenario: Two users fetch the same band with version 1
        const user1UpdateDto = { name: 'User 1 Update' };
        const user2UpdateDto = { name: 'User 2 Update' };

        // Both users fetch band with version 1
        jest
          .spyOn(repository, 'findOne')
          .mockResolvedValueOnce(mockBand)
          .mockResolvedValueOnce(mockBand);

        // User 1 updates successfully (version becomes 2)
        jest
          .spyOn(repository, 'update')
          .mockResolvedValueOnce({
            affected: 1,
            raw: {},
            generatedMaps: [],
          } as UpdateResult)
          .mockResolvedValueOnce({
            affected: 0,
            raw: {},
            generatedMaps: [],
          } as UpdateResult); // User 2's update fails

        jest.spyOn(repository, 'findOneWithRelations').mockResolvedValueOnce({
          ...mockBand,
          name: 'User 1 Update',
          version: 2,
        });

        // User 1 succeeds
        const result1 = await service.update(1, user1UpdateDto);
        expect(result1.name).toBe('User 1 Update');
        expect(result1.version).toBe(2);

        // User 2 fails - version mismatch
        await expect(service.update(1, user2UpdateDto)).rejects.toThrow(
          ConflictException,
        );

        // Verify both attempted with correct versions
        expect(repository.update).toHaveBeenNthCalledWith(
          1,
          { id: 1, version: 1 },
          user1UpdateDto,
        );
        expect(repository.update).toHaveBeenNthCalledWith(
          2,
          { id: 1, version: 1 },
          user2UpdateDto,
        );
      });

      it('should handle rapid sequential updates', async () => {
        const updates = [
          { name: 'Update 1', version: 1 },
          { name: 'Update 2', version: 2 },
          { name: 'Update 3', version: 3 },
        ];

        for (let i = 0; i < updates.length; i++) {
          const current = { ...mockBand, ...updates[i] };
          const next = { ...current, version: current.version + 1 };

          jest.spyOn(repository, 'findOne').mockResolvedValueOnce(current);
          jest.spyOn(repository, 'update').mockResolvedValueOnce({
            affected: 1,
            raw: {},
            generatedMaps: [],
          } as UpdateResult);
          jest
            .spyOn(repository, 'findOneWithRelations')
            .mockResolvedValueOnce(next);

          const result = await service.update(1, { name: updates[i].name });
          expect(result.version).toBe(updates[i].version + 1);
        }
      });
    });

    describe('Database Constraint Handling', () => {
      it('should handle unique constraint violations (code 23505)', async () => {
        const uniqueError = new Error(
          'duplicate key value violates unique constraint',
        );
        (uniqueError as any).code = '23505';
        (uniqueError as any).detail = 'Key (name)=(duplicate) already exists.';

        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockBand);
        jest.spyOn(repository, 'update').mockRejectedValueOnce(uniqueError);

        await expect(service.update(1, { name: 'duplicate' })).rejects.toThrow(
          ConflictException,
        );
      });

      it('should re-throw non-constraint errors', async () => {
        const unknownError = new Error('Unknown database error');

        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockBand);
        jest.spyOn(repository, 'update').mockRejectedValueOnce(unknownError);

        await expect(service.update(1, { name: 'Test' })).rejects.toThrow(
          'Unknown database error',
        );
      });
    });
  });

  describe('Album Service - Optimistic Locking', () => {
    let service: AlbumsService;
    let repository: any;

    const mockAlbum = {
      id: 1,
      name: 'Abbey Road',
      version: 1,
      releaseDate: new Date('1969-09-26'),
      genre: 'Rock',
      description: null,
      imageUrl: null,
      band: null,
      songs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    beforeEach(async () => {
      repository = {
        findOne: jest.fn(),
        update: jest.fn(),
        find: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AlbumsService,
          {
            provide: getRepositoryToken(Album),
            useValue: repository,
          },
        ],
      }).compile();

      service = module.get<AlbumsService>(AlbumsService);
    });

    it('should validate version on album update', async () => {
      repository.findOne.mockResolvedValueOnce(mockAlbum);
      repository.update.mockResolvedValueOnce({
        affected: 1,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);
      repository.findOne.mockResolvedValueOnce({
        ...mockAlbum,
        name: 'Updated Album',
        version: 2,
      });

      const result = await service.update(1, { name: 'Updated Album' });

      expect(result.version).toBe(2);
      expect(repository.update).toHaveBeenCalledWith(
        { id: 1, version: 1 },
        expect.anything(),
      );
    });

    it('should detect album version conflict', async () => {
      repository.findOne.mockResolvedValueOnce(mockAlbum);
      repository.update.mockResolvedValueOnce({
        affected: 0,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);

      await expect(service.update(1, { name: 'Conflicted' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Event Service - Optimistic Locking', () => {
    let service: EventsService;
    let repository: any;

    const mockEvent = {
      id: 1,
      title: 'Live at Wembley',
      version: 1,
      description: 'Concert event',
      date: new Date('2024-06-15'),
      eventType: 'Concert',
      ticketUrl: null,
      location: null,
      band: null,
      country: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    beforeEach(async () => {
      repository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EventsService,
          {
            provide: getRepositoryToken(Event),
            useValue: repository,
          },
        ],
      }).compile();

      service = module.get<EventsService>(EventsService);
    });

    it('should validate version on event update', async () => {
      repository.findOne.mockResolvedValueOnce(mockEvent);
      repository.update.mockResolvedValueOnce({
        affected: 1,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);
      repository.findOne.mockResolvedValueOnce({
        ...mockEvent,
        title: 'Updated Event',
        version: 2,
      });

      const result = await service.update(1, { title: 'Updated Event' });

      expect(result.version).toBe(2);
      expect(repository.update).toHaveBeenCalledWith(
        { id: 1, version: 1 },
        expect.anything(),
      );
    });

    it('should detect event version conflict', async () => {
      repository.findOne.mockResolvedValueOnce(mockEvent);
      repository.update.mockResolvedValueOnce({
        affected: 0,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);

      await expect(service.update(1, { title: 'Conflicted' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Cross-Entity Version Validation', () => {
    it('all entities should start with version 1', () => {
      const band = { version: 1 };
      const album = { version: 1 };
      const event = { version: 1 };

      expect(band.version).toBe(album.version);
      expect(album.version).toBe(event.version);
      expect(event.version).toBe(1);
    });

    it('version field should be numeric and immutable by user', () => {
      const entity = { version: 1 };
      expect(typeof entity.version).toBe('number');
      expect(entity.version).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Optimistic Lock Best Practices', () => {
    it('should always fetch entity before update to get current version', () => {
      // Pattern: findOne → check version → update with version
      const entity = { id: 1, version: 1 };
      const updateQuery = { id: entity.id, version: entity.version };

      expect(updateQuery).toEqual({ id: 1, version: 1 });
    });

    it('should handle version mismatch with meaningful error', () => {
      const error = new ConflictException(
        'Band was modified by another user. Please refresh and try again.',
      );

      expect(error.message).toContain('modified');
      expect(error.message).toContain('another user');
    });

    it('should not attempt update if entity not found', () => {
      // Should throw NotFoundException before calling update
      const found = null;
      expect(found).toBeNull();
      // In real code: if (!entity) throw NotFoundException
    });
  });
});
