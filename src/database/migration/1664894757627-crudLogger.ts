import { MigrationInterface, QueryRunner } from "typeorm";

export class crudLogger1664894757627 implements MigrationInterface {
    name = 'crudLogger1664894757627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cat_toy_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "catId" integer, CONSTRAINT "PK_ac5c1672d60b151112f65ebcf09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, "age" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "homeId" integer, CONSTRAINT "REL_26db7bdfb66a9c72a48e4fa285" UNIQUE ("homeId"), CONSTRAINT "PK_676cf6dbf9d1d7d216ecd87c4f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_home_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6bdfe5785861b7dad300f8f0ec0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."logger_action_type_enum" AS ENUM('update', 'delete')`);
        await queryRunner.query(`CREATE TABLE "logger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "entity_type" character varying NOT NULL, "identifier" character varying NOT NULL, "action_type" "public"."logger_action_type_enum" NOT NULL DEFAULT 'update', "previous_values" json NOT NULL, "new_values" json NOT NULL, "operated_by" character varying NOT NULL, CONSTRAINT "PK_46cad7e44f77ea2fa7da01e7828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cat_toy_entity" ADD CONSTRAINT "FK_441e45eec97723bb12d5123213a" FOREIGN KEY ("catId") REFERENCES "cat_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cat_entity" ADD CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854" FOREIGN KEY ("homeId") REFERENCES "cat_home_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cat_entity" DROP CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854"`);
        await queryRunner.query(`ALTER TABLE "cat_toy_entity" DROP CONSTRAINT "FK_441e45eec97723bb12d5123213a"`);
        await queryRunner.query(`DROP TABLE "logger"`);
        await queryRunner.query(`DROP TYPE "public"."logger_action_type_enum"`);
        await queryRunner.query(`DROP TABLE "cat_home_entity"`);
        await queryRunner.query(`DROP TABLE "cat_entity"`);
        await queryRunner.query(`DROP TABLE "cat_toy_entity"`);
    }

}
