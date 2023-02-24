import { MigrationInterface, QueryRunner } from 'typeorm';

export class discussionUpdate1677144076972 implements MigrationInterface {
  name = 'discussionUpdate1677144076972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "discussion" DROP COLUMN "title"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "discussion" ADD "title" character varying NOT NULL`,
    );
  }
}
