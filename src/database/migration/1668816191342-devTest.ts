import { MigrationInterface, QueryRunner } from 'typeorm';

export class devTest1668816191342 implements MigrationInterface {
  name = 'devTest1668816191342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev_testing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "url" character varying NOT NULL, "route" character varying NOT NULL, "method" character varying NOT NULL, "requestStatus" character varying NOT NULL, "profileId" character varying NOT NULL, CONSTRAINT "PK_d57f5dd22181794eef1088d7976" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dev_testing"`);
  }
}
