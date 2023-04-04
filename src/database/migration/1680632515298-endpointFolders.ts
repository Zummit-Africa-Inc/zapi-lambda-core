import { MigrationInterface, QueryRunner } from 'typeorm';

export class endpointFolders1680632515298 implements MigrationInterface {
  name = 'endpointFolders1680632515298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "endpoint_folder" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP DEFAULT now(), "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "apiId" character varying, CONSTRAINT "PK_c235388c87e858ba37023d72d18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ADD CONSTRAINT "FK_40fb130a54f5d4881b1ed56addd" FOREIGN KEY ("folderId") REFERENCES "endpoint_folder"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "endpoint" DROP CONSTRAINT "FK_40fb130a54f5d4881b1ed56addd"`,
    );
    await queryRunner.query(`DROP TABLE "endpoint_folder"`);
  }
}
