import { MigrationInterface, QueryRunner } from 'typeorm';

export class endpointContentTypeRefactor1680149834110
  implements MigrationInterface
{
  name = 'endpointContentTypeRefactor1680149834110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "contentType"`);
    await queryRunner.query(
      `CREATE TYPE "public"."endpoint_contenttype_enum" AS ENUM('application/x-www-form-urlencoded', 'application/octet-stream', 'multipart/form-data', 'application/graphql', 'application/json', 'application/xml', 'text/plain')`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "contentType" "public"."endpoint_contenttype_enum" DEFAULT 'application/json'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "contentType"`);
    await queryRunner.query(`DROP TYPE "public"."endpoint_contenttype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD "contentType" character varying`,
    );
  }
}
