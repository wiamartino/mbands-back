import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImproveSchema1721475600000 implements MigrationInterface {
  name = 'ImproveSchema1721475600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add timestamps and additional columns to Band table
    await queryRunner.query(`
      ALTER TABLE "band" 
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "imageUrl" character varying(500),
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Add constraints to Band table
    await queryRunner.query(`
      ALTER TABLE "band" 
      ALTER COLUMN "name" TYPE character varying(255),
      ALTER COLUMN "genre" TYPE character varying(100),
      ALTER COLUMN "country" TYPE character varying(100),
      ALTER COLUMN "website" TYPE character varying(500);
    `);

    // Add unique constraint to band name if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "band" 
      ADD CONSTRAINT IF NOT EXISTS "UQ_band_name" UNIQUE ("name");
    `);

    // Add check constraint for year formed
    await queryRunner.query(`
      ALTER TABLE "band" 
      ADD CONSTRAINT IF NOT EXISTS "CHK_band_year_formed" 
      CHECK ("yearFormed" >= 1900 AND "yearFormed" <= EXTRACT(YEAR FROM CURRENT_DATE));
    `);

    // Create indexes for Band table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_band_genre_country" ON "band" ("genre", "country");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_band_yearFormed" ON "band" ("yearFormed");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_band_active" ON "band" ("active");`);

    // Update Member table
    await queryRunner.query(`
      ALTER TABLE "member" 
      ADD COLUMN IF NOT EXISTS "joinDate" date,
      ADD COLUMN IF NOT EXISTS "leaveDate" date,
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "biography" text,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Update Member table constraints
    await queryRunner.query(`
      ALTER TABLE "member" 
      ALTER COLUMN "name" TYPE character varying(255);
    `);

    // Add Other to instrument enum if not exists
    await queryRunner.query(`
      ALTER TYPE "member_instrument_enum" ADD VALUE IF NOT EXISTS 'Other';
    `);

    // Update Song table
    await queryRunner.query(`
      ALTER TABLE "song" 
      ADD COLUMN IF NOT EXISTS "duration" integer,
      ADD COLUMN IF NOT EXISTS "trackNumber" integer,
      ADD COLUMN IF NOT EXISTS "lyrics" text,
      ADD COLUMN IF NOT EXISTS "videoUrl" character varying(500),
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Update Song table constraints
    await queryRunner.query(`
      ALTER TABLE "song" 
      ALTER COLUMN "title" TYPE character varying(255);
    `);

    // Create index for Song title
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_song_title" ON "song" ("title");`);

    // Update Album table
    await queryRunner.query(`
      ALTER TABLE "album" 
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "coverImageUrl" character varying(500),
      ADD COLUMN IF NOT EXISTS "totalTracks" integer,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Update Album table constraints
    await queryRunner.query(`
      ALTER TABLE "album" 
      ALTER COLUMN "name" TYPE character varying(255),
      ALTER COLUMN "genre" TYPE character varying(100),
      ALTER COLUMN "label" TYPE character varying(255),
      ALTER COLUMN "producer" TYPE character varying(255),
      ALTER COLUMN "website" TYPE character varying(500);
    `);

    // Create indexes for Album table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_album_releaseDate" ON "album" ("releaseDate");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_album_genre" ON "album" ("genre");`);

    // Update User table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "firstName" character varying(100),
      ADD COLUMN IF NOT EXISTS "lastName" character varying(100),
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Update User table constraints
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "username" TYPE character varying(50),
      ALTER COLUMN "password" TYPE character varying(255),
      ALTER COLUMN "email" TYPE character varying(255);
    `);

    // Add unique constraints to User table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD CONSTRAINT IF NOT EXISTS "UQ_user_username" UNIQUE ("username"),
      ADD CONSTRAINT IF NOT EXISTS "UQ_user_email" UNIQUE ("email");
    `);

    // Create indexes for User table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_username" ON "user" ("username");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_email" ON "user" ("email");`);

    // Update Role table
    await queryRunner.query(`
      ALTER TABLE "role" 
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Update Role table constraints
    await queryRunner.query(`
      ALTER TABLE "role" 
      ALTER COLUMN "name" TYPE character varying(50);
    `);

    // Add unique constraint to Role name
    await queryRunner.query(`
      ALTER TABLE "role" 
      ADD CONSTRAINT IF NOT EXISTS "UQ_role_name" UNIQUE ("name");
    `);

    // Update Event table
    await queryRunner.query(`
      ALTER TABLE "event" 
      ADD COLUMN IF NOT EXISTS "eventType" character varying NOT NULL DEFAULT 'Concert',
      ADD COLUMN IF NOT EXISTS "venue" character varying(255),
      ADD COLUMN IF NOT EXISTS "city" character varying(100),
      ADD COLUMN IF NOT EXISTS "country" character varying(100),
      ADD COLUMN IF NOT EXISTS "ticketPrice" numeric(10,2),
      ADD COLUMN IF NOT EXISTS "ticketUrl" character varying(500),
      ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
    `);

    // Update Event table constraints
    await queryRunner.query(`
      ALTER TABLE "event" 
      ALTER COLUMN "title" TYPE character varying(255),
      ALTER COLUMN "description" TYPE text;
    `);

    // Create event type enum if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "event_eventtype_enum" AS ENUM('Concert', 'Festival', 'Tour', 'Recording', 'Interview', 'Other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Update event type column to use enum
    await queryRunner.query(`
      ALTER TABLE "event" 
      ALTER COLUMN "eventType" TYPE "event_eventtype_enum" USING "eventType"::"event_eventtype_enum";
    `);

    // Create indexes for Event table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_event_date" ON "event" ("date");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_event_eventType" ON "event" ("eventType");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove added columns and constraints (reverse migration)
    
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_event_eventType";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_event_date";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_album_genre";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_album_releaseDate";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_song_title";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_email";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_username";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_band_active";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_band_yearFormed";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_band_genre_country";`);

    // Drop constraints
    await queryRunner.query(`ALTER TABLE "band" DROP CONSTRAINT IF EXISTS "CHK_band_year_formed";`);
    await queryRunner.query(`ALTER TABLE "band" DROP CONSTRAINT IF EXISTS "UQ_band_name";`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "UQ_user_email";`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "UQ_user_username";`);
    await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT IF EXISTS "UQ_role_name";`);

    // Remove added columns from all tables
    const tables = ['band', 'member', 'song', 'album', 'user', 'role', 'event'];
    const timestampColumns = ['createdAt', 'updatedAt', 'deletedAt'];
    
    for (const table of tables) {
      for (const column of timestampColumns) {
        await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}";`);
      }
    }

    // Remove specific columns
    await queryRunner.query(`ALTER TABLE "band" DROP COLUMN IF EXISTS "description", DROP COLUMN IF EXISTS "imageUrl";`);
    await queryRunner.query(`ALTER TABLE "member" DROP COLUMN IF EXISTS "joinDate", DROP COLUMN IF EXISTS "leaveDate", DROP COLUMN IF EXISTS "isActive", DROP COLUMN IF EXISTS "biography";`);
    await queryRunner.query(`ALTER TABLE "song" DROP COLUMN IF EXISTS "duration", DROP COLUMN IF EXISTS "trackNumber", DROP COLUMN IF EXISTS "lyrics", DROP COLUMN IF EXISTS "videoUrl";`);
    await queryRunner.query(`ALTER TABLE "album" DROP COLUMN IF EXISTS "description", DROP COLUMN IF EXISTS "coverImageUrl", DROP COLUMN IF EXISTS "totalTracks";`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "firstName", DROP COLUMN IF EXISTS "lastName", DROP COLUMN IF EXISTS "isActive", DROP COLUMN IF EXISTS "lastLoginAt";`);
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN IF EXISTS "description";`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN IF EXISTS "eventType", DROP COLUMN IF EXISTS "venue", DROP COLUMN IF EXISTS "city", DROP COLUMN IF EXISTS "country", DROP COLUMN IF EXISTS "ticketPrice", DROP COLUMN IF EXISTS "ticketUrl", DROP COLUMN IF EXISTS "isActive";`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "event_eventtype_enum";`);
  }
}
