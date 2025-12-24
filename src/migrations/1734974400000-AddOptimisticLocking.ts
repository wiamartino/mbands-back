import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOptimisticLocking1734974400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add version column to band table
    await queryRunner.query(`
      ALTER TABLE "band"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
    `);

    // Add version column to album table
    await queryRunner.query(`
      ALTER TABLE "album"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
    `);

    // Add version column to event table
    await queryRunner.query(`
      ALTER TABLE "event"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
    `);

    // Create indexes on version columns for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_band_version" ON "band" ("version");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_album_version" ON "album" ("version");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_event_version" ON "event" ("version");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_event_version";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_album_version";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_band_version";`);

    // Remove version columns
    await queryRunner.query(`
      ALTER TABLE "event"
      DROP COLUMN IF EXISTS "version";
    `);

    await queryRunner.query(`
      ALTER TABLE "album"
      DROP COLUMN IF EXISTS "version";
    `);

    await queryRunner.query(`
      ALTER TABLE "band"
      DROP COLUMN IF EXISTS "version";
    `);
  }
}
