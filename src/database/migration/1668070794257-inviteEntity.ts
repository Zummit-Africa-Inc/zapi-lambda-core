import { MigrationInterface, QueryRunner } from "typeorm";

export class inviteEntity1668070794257 implements MigrationInterface {
    name = 'inviteEntity1668070794257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "apiId" character varying NOT NULL, "apiAuthor" character varying NOT NULL, "inviteeEmail" character varying NOT NULL, "inviteeId" character varying NOT NULL, "token" character varying NOT NULL, CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "invitation"`);
    }

}
