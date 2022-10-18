import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateEndpoint1665699605623 implements MigrationInterface {
  name = 'updateEndpoint1665699605623';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
  }
}
