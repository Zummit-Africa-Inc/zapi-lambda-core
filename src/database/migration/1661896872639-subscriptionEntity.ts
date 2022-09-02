import { MigrationInterface, QueryRunner } from "typeorm";

export class subscriptionEntity1661896872639 implements MigrationInterface {
    name = 'subscriptionEntity1661896872639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "apiId" uuid NOT NULL, "profileId" uuid NOT NULL, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."api_status_enum" AS ENUM('verified', 'unverified')`);
        await queryRunner.query(`CREATE TYPE "public"."api_visibility_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`CREATE TABLE "api" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "description" character varying NOT NULL, "base_url" character varying NOT NULL, "popularity" integer NOT NULL DEFAULT '0', "about" character varying, "subscriptions" text array DEFAULT '{}', "status" "public"."api_status_enum" NOT NULL DEFAULT 'unverified', "visibility" "public"."api_visibility_enum" NOT NULL DEFAULT 'private', "rating" integer NOT NULL DEFAULT '0', "service_level" integer NOT NULL DEFAULT '0', "latency" integer NOT NULL DEFAULT '0', "categoryId" uuid NOT NULL, "profileId" uuid NOT NULL, "secretKey" character varying, "tutorialsId" character varying, CONSTRAINT "UQ_8ce91749da904c1cb16bb4e06c1" UNIQUE ("name"), CONSTRAINT "PK_12f6cbe9e79197c2bf4c79c009d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_0253e1137348aa4ec36b503b006" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api" ADD CONSTRAINT "FK_a97d009aa61e381793871969509" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api" ADD CONSTRAINT "FK_85a54167d077f66ff2612ebb62c" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api" DROP CONSTRAINT "FK_85a54167d077f66ff2612ebb62c"`);
        await queryRunner.query(`ALTER TABLE "api" DROP CONSTRAINT "FK_a97d009aa61e381793871969509"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_0253e1137348aa4ec36b503b006"`);
        await queryRunner.query(`DROP TABLE "api"`);
        await queryRunner.query(`DROP TYPE "public"."api_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."api_status_enum"`);
        await queryRunner.query(`DROP TABLE "subscription"`);
    }

}
