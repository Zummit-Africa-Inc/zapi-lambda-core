import { MigrationInterface, QueryRunner } from "typeorm";

export class analytics1663151740372 implements MigrationInterface {
    name = 'analytics1663151740372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "analytics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "totalLatency" integer NOT NULL DEFAULT '0', "averageLatency" integer NOT NULL DEFAULT '0', "apiId" character varying, "successful_calls" integer NOT NULL DEFAULT '0', "total_calls" integer NOT NULL DEFAULT '0', "total_errors" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3c96dcbf1e4c57ea9e0c3144bff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "latency" integer, "profileId" character varying NOT NULL, "errorMessage" character varying, "status" integer NOT NULL, "apiId" character varying NOT NULL, "endpoint" character varying NOT NULL, "method" character varying NOT NULL, CONSTRAINT "PK_db8d22d8fe684d8a0cbd33a6df2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "analytics_logs"`);
        await queryRunner.query(`DROP TABLE "analytics"`);
    }

}
