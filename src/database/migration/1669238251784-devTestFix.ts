import { MigrationInterface, QueryRunner } from 'typeorm';

export class devTestFix1669238251784 implements MigrationInterface {
  name = 'devTestFix1669238251784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev_testing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "profileId" character varying NOT NULL, "apiId" character varying NOT NULL, "endpointId" character varying NOT NULL, "route" character varying NOT NULL, "method" character varying NOT NULL, "name" character varying NOT NULL, "payload" jsonb DEFAULT '{}', CONSTRAINT "PK_d57f5dd22181794eef1088d7976" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev_testing"`);
  }
}
