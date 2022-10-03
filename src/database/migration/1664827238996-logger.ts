import { MigrationInterface, QueryRunner } from "typeorm";

export class logger1664827238996 implements MigrationInterface {
    name = 'logger1664827238996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "logger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "entity_type" character varying NOT NULL, "identifier" character varying NOT NULL, "action_type" "public"."logger_action_type_enum" NOT NULL DEFAULT 'update', "previous_values" json NOT NULL, "new_values" json NOT NULL, "operated_by" character varying NOT NULL, CONSTRAINT "PK_46cad7e44f77ea2fa7da01e7828" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "logger"`);
    }

}
