import { MigrationInterface, QueryRunner } from 'typeorm';

export class endpointContentType1680067961929 implements MigrationInterface {
  name = 'endpointContentType1680067961929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "contentType" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "contentType"`);
  }
}
