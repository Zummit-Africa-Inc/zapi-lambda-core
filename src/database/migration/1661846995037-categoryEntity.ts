import { MigrationInterface, QueryRunner } from 'typeorm';

export class categoryEntity1661846995037 implements MigrationInterface {
  name = 'categoryEntity1661846995037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" RENAME COLUMN "subscription" TO "subscriptions"`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "description" character varying, "api" text array DEFAULT '{}', CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(
      `ALTER TABLE "profile" RENAME COLUMN "subscriptions" TO "subscription"`,
    );
  }
}
