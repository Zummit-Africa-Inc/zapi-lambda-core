import { MigrationInterface, QueryRunner } from 'typeorm';

export class apiReadme1663834457392 implements MigrationInterface {
  name = 'apiReadme1663834457392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api" ADD "read_me" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "read_me"`);
  }
}
