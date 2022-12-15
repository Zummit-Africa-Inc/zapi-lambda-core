import { MigrationInterface, QueryRunner } from 'typeorm';

export class profileUpdate1671133175988 implements MigrationInterface {
  name = 'profileUpdate1671133175988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "bio" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "country" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD "fullName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "fullName"`);
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "bio"`);
  }
}
