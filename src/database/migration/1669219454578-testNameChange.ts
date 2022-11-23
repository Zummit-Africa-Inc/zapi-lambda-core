import { MigrationInterface, QueryRunner } from 'typeorm';

export class testNameChange1669219454578 implements MigrationInterface {
  name = 'testNameChange1669219454578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev_testing" RENAME COLUMN "testName" TO "name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev_testing" RENAME COLUMN "name" TO "testName"`,
    );
  }
}
