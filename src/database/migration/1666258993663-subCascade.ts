import { MigrationInterface, QueryRunner } from 'typeorm';

export class subCascade1666258993663 implements MigrationInterface {
  name = 'subCascade1666258993663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_0253e1137348aa4ec36b503b006"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_0253e1137348aa4ec36b503b006" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_0253e1137348aa4ec36b503b006"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_0253e1137348aa4ec36b503b006" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
