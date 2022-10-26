import { MigrationInterface, QueryRunner } from 'typeorm';

export class endpointRefactor1666817301630 implements MigrationInterface {
  name = 'endpointRefactor1666817301630';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_0253e1137348aa4ec36b503b006"`,
    );
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "requestBody"`);
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "query" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "body" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "headers"`);
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "headers" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "previous_values" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "new_values" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "previous_values" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "new_values" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_0253e1137348aa4ec36b503b006" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_0253e1137348aa4ec36b503b006"`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "new_values" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "previous_values" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "new_values" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "previous_values" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "headers"`);
    await queryRunner.query(`ALTER TABLE "endpoint" ADD "headers" text array`);
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "query"`);
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "requestBody" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_0253e1137348aa4ec36b503b006" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
