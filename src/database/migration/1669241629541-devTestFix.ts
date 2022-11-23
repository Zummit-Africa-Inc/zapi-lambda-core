import { MigrationInterface, QueryRunner } from 'typeorm';

export class devTestFix1669241629541 implements MigrationInterface {
  name = 'devTestFix1669241629541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "url"`);
    await queryRunner.query(
      `ALTER TABLE "dev_testing" DROP COLUMN "requestStatus"`,
    );
    await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "testName"`);
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ADD "endpointId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ADD "payload" jsonb DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "payload"`);
    await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "dev_testing" DROP COLUMN "endpointId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ADD "testName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ADD "requestStatus" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ADD "url" character varying NOT NULL`,
    );
  }
}
