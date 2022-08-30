import { MigrationInterface, QueryRunner } from "typeorm";

export class endpointEntity1661895602787 implements MigrationInterface {
    name = 'endpointEntity1661895602787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."endpoint_method_enum" AS ENUM('get', 'post', 'put', 'patch', 'delete')`);
        await queryRunner.query(`CREATE TABLE "endpoint" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "method" "public"."endpoint_method_enum" DEFAULT 'get', "route" character varying NOT NULL, "apiId" character varying NOT NULL, "description" character varying NOT NULL, "headers" text array, "requestBody" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_7785c5c2cf24e6ab3abb7a2e89f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "endpoint"`);
        await queryRunner.query(`DROP TYPE "public"."endpoint_method_enum"`);
    }

}
