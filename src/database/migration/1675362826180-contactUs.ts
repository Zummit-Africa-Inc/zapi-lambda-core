import { MigrationInterface, QueryRunner } from "typeorm";

export class contactUs1675362826180 implements MigrationInterface {
  name = 'contactUs1675362826180';

  public async up(queryRunner: QueryRunner): Promise<void> {
 
    await queryRunner.query(
      `CREATE TYPE "public"."contact_us_goal_enum" AS ENUM('partnership', 'support', 'pricing', 'api', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contact_us" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP DEFAULT now(), "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "org_name" character varying, "email" character varying NOT NULL, "phone_call" boolean DEFAULT false, "message" character varying NOT NULL, "goal" "public"."contact_us_goal_enum" NOT NULL DEFAULT 'other', CONSTRAINT "PK_b61766a4d93470109266b976cfe" PRIMARY KEY ("id"))`,
    );
  
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
   
    await queryRunner.query(`DROP TABLE "contact_us"`);
    await queryRunner.query(`DROP TYPE "public"."contact_us_goal_enum"`);
  }
}
