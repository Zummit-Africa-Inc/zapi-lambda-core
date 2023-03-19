import { MigrationInterface, QueryRunner } from 'typeorm';

export class pricing1679254599054 implements MigrationInterface {
  name = 'pricing1679254599054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "planName"`);
    await queryRunner.query(
      `ALTER TABLE "pricing" DROP COLUMN "requestDuration"`,
    );
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "planPrice"`);
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "requestLimit" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "requestCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "pricingId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pricing_name_enum" AS ENUM('basic', 'pro', 'ultra', 'mega')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "name" "public"."pricing_name_enum" NOT NULL DEFAULT 'basic'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "price" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "pricing" ADD "apiId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "requestLimit" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD CONSTRAINT "FK_21703f2ae16f46d4e3411f0252c" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pricing" DROP CONSTRAINT "FK_21703f2ae16f46d4e3411f0252c"`,
    );
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "requestLimit"`);
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "apiId"`);
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "name"`);
    await queryRunner.query(`DROP TYPE "public"."pricing_name_enum"`);
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "pricingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "requestCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "requestLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "planPrice" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "requestDuration" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "planName" character varying NOT NULL`,
    );
  }
}
