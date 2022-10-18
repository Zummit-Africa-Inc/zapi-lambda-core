import { MigrationInterface, QueryRunner } from 'typeorm';

export class cascadeEntity1664832949011 implements MigrationInterface {
  name = 'cascadeEntity1664832949011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" DROP CONSTRAINT "FK_a97d009aa61e381793871969509"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ADD CONSTRAINT "FK_a97d009aa61e381793871969509" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api" DROP CONSTRAINT "FK_a97d009aa61e381793871969509"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ADD CONSTRAINT "FK_a97d009aa61e381793871969509" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
