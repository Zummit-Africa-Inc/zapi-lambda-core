import { MigrationInterface, QueryRunner } from "typeorm";

export class feedback1667909107484 implements MigrationInterface {
    name = 'feedback1667909107484'

    public async up(queryRunner: QueryRunner): Promise<void> {
      
        await queryRunner.query(`CREATE TYPE "public"."feedback_category_enum" AS ENUM('feedback', 'complaint', 'request', 'enquire', 'error')`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "email" character varying NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "category" "public"."feedback_category_enum" NOT NULL DEFAULT 'feedback', CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_category_enum"`);
    }

}
