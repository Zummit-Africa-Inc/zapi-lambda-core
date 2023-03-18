import { MigrationInterface, QueryRunner } from 'typeorm';

export class pricingPlan1679159934383 implements MigrationInterface {
  name = 'pricingPlan1679159934383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pricing_plan_name_enum" AS ENUM('basic', 'pro', 'ultra', 'mega')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pricing_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP DEFAULT now(), "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" "public"."pricing_plan_name_enum" NOT NULL DEFAULT 'basic', "price" integer NOT NULL DEFAULT '0', "apiId" character varying NOT NULL, "description" character varying NOT NULL, "requestLimit" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_6c58c7053b6a1404176154fe47f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "requestLimit" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "requestCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD "pricingPlanId" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_ecae245992881aa35c8ffbcc215" FOREIGN KEY ("pricingPlanId") REFERENCES "pricing_plan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_ecae245992881aa35c8ffbcc215"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "pricingPlanId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "requestCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP COLUMN "requestLimit"`,
    );
    await queryRunner.query(`DROP TABLE "pricing_plan"`);
    await queryRunner.query(`DROP TYPE "public"."pricing_plan_name_enum"`);
  }
}
