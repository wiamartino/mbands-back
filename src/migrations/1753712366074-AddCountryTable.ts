import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryTable1753712366074 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Country table
        await queryRunner.query(`
            CREATE TABLE "country" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "code" character varying(3) NOT NULL,
                "alpha2Code" character varying(2) NOT NULL,
                "numericCode" integer,
                "region" character varying(100),
                "subregion" character varying(100),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_country_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_country_name" UNIQUE ("name"),
                CONSTRAINT "UQ_country_code" UNIQUE ("code"),
                CONSTRAINT "UQ_country_alpha2Code" UNIQUE ("alpha2Code")
            )
        `);

        // Create indexes for Country table
        await queryRunner.query(`CREATE INDEX "IDX_country_name" ON "country" ("name")`);
        await queryRunner.query(`CREATE INDEX "IDX_country_code" ON "country" ("code")`);

        // Insert default countries first
        await queryRunner.query(`
            INSERT INTO "country" ("name", "code", "alpha2Code", "numericCode", "region", "subregion") VALUES
            ('United States', 'USA', 'US', 840, 'Americas', 'Northern America'),
            ('United Kingdom', 'GBR', 'GB', 826, 'Europe', 'Northern Europe'),
            ('Canada', 'CAN', 'CA', 124, 'Americas', 'Northern America'),
            ('Germany', 'DEU', 'DE', 276, 'Europe', 'Western Europe'),
            ('France', 'FRA', 'FR', 250, 'Europe', 'Western Europe'),
            ('Italy', 'ITA', 'IT', 380, 'Europe', 'Southern Europe'),
            ('Spain', 'ESP', 'ES', 724, 'Europe', 'Southern Europe'),
            ('Japan', 'JPN', 'JP', 392, 'Asia', 'Eastern Asia'),
            ('Australia', 'AUS', 'AU', 36, 'Oceania', 'Australia and New Zealand'),
            ('Brazil', 'BRA', 'BR', 76, 'Americas', 'South America'),
            ('Mexico', 'MEX', 'MX', 484, 'Americas', 'Central America'),
            ('Sweden', 'SWE', 'SE', 752, 'Europe', 'Northern Europe'),
            ('Norway', 'NOR', 'NO', 578, 'Europe', 'Northern Europe'),
            ('Finland', 'FIN', 'FI', 246, 'Europe', 'Northern Europe'),
            ('Netherlands', 'NLD', 'NL', 528, 'Europe', 'Western Europe')
        `);

        // Check if band table has old country column and handle migration
        const bandTableExists = await queryRunner.hasTable('band');
        if (bandTableExists) {
            const hasOldCountryColumn = await queryRunner.hasColumn('band', 'country');
            
            // Add new country_id column to band table
            await queryRunner.query(`ALTER TABLE "band" ADD COLUMN "country_id" integer`);

            if (hasOldCountryColumn) {
                // Migrate existing data from string country to country_id
                await queryRunner.query(`
                    UPDATE "band" SET "country_id" = (
                        SELECT c.id FROM "country" c 
                        WHERE c.name = "band"."country" 
                        LIMIT 1
                    ) WHERE "band"."country" IS NOT NULL
                `);

                // Drop the old country string column and its index
                await queryRunner.query(`DROP INDEX IF EXISTS "IDX_band_genre_country"`);
                await queryRunner.query(`ALTER TABLE "band" DROP COLUMN "country"`);
            }

            // Make country_id NOT NULL for bands (assuming all bands should have a country)
            await queryRunner.query(`
                UPDATE "band" SET "country_id" = (
                    SELECT id FROM "country" WHERE name = 'United States' LIMIT 1
                ) WHERE "country_id" IS NULL
            `);
            await queryRunner.query(`ALTER TABLE "band" ALTER COLUMN "country_id" SET NOT NULL`);
        }

        // Check if event table exists and handle migration
        const eventTableExists = await queryRunner.hasTable('event');
        if (eventTableExists) {
            const hasOldCountryColumn = await queryRunner.hasColumn('event', 'country');
            
            // Add country_id column to event table (nullable)
            await queryRunner.query(`ALTER TABLE "event" ADD COLUMN "country_id" integer`);

            if (hasOldCountryColumn) {
                // Migrate existing data from string country to country_id
                await queryRunner.query(`
                    UPDATE "event" SET "country_id" = (
                        SELECT c.id FROM "country" c 
                        WHERE c.name = "event"."country" 
                        LIMIT 1
                    ) WHERE "event"."country" IS NOT NULL
                `);

                // Drop the old country string column
                await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "country"`);
            }
        }

        // Create foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "band" 
            ADD CONSTRAINT "FK_band_country" 
            FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "event" 
            ADD CONSTRAINT "FK_event_country" 
            FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE CASCADE
        `);

        // Create new indexes
        await queryRunner.query(`CREATE INDEX "IDX_band_genre_country_id" ON "band" ("genre", "country_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "band" DROP CONSTRAINT IF EXISTS "FK_band_country"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT IF EXISTS "FK_event_country"`);

        // Drop new indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_band_genre_country_id"`);

        // Remove country_id columns
        await queryRunner.query(`ALTER TABLE "band" DROP COLUMN IF EXISTS "country_id"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN IF EXISTS "country_id"`);

        // Drop Country table indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_country_code"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_country_name"`);

        // Drop Country table
        await queryRunner.query(`DROP TABLE IF EXISTS "country"`);
    }
}
