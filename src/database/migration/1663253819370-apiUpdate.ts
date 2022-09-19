import { MigrationInterface, QueryRunner } from 'typeorm';

export class apiUpdate1663253819370 implements MigrationInterface {
  name = 'apiUpdate1663253819370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api" ADD "logo_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ADD "api_website" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ADD "term_of_use" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "term_of_use"`);
    await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "api_website"`);
    await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "logo_url"`);
  }
}
