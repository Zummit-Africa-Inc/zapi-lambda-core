import { MigrationInterface, QueryRunner } from 'typeorm';

export class categoryUpdate1662138179713 implements MigrationInterface {
  name = 'categoryUpdate1662138179713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "api"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" ADD "api" text array DEFAULT '{}'`,
    );
  }
}
