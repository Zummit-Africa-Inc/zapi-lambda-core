import { MigrationInterface, QueryRunner } from 'typeorm';

export class endpointFolders1680606877721 implements MigrationInterface {
  name = 'endpointFolders1680606877721';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "endpoint_folder" DROP CONSTRAINT "FK_7f3197f36d4ac5daac21cfbdf06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint_folder" DROP COLUMN "apiId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint_folder" ADD "apiId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "endpoint_folder" DROP COLUMN "apiId"`,
    );
    await queryRunner.query(`ALTER TABLE "endpoint_folder" ADD "apiId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "endpoint_folder" ADD CONSTRAINT "FK_7f3197f36d4ac5daac21cfbdf06" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
