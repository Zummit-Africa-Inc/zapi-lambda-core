import { MigrationInterface, QueryRunner } from "typeorm";

export class fixProfile1661507038489 implements MigrationInterface {
    name = 'fixProfile1661507038489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" RENAME COLUMN "userID" TO "userId"`);
        await queryRunner.query(`CREATE TYPE "public"."pricing_planname_enum" AS ENUM('Basic', 'Pro', 'Mega', 'Ultra')`);
        await queryRunner.query(`CREATE TABLE "pricing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "planName" "public"."pricing_planname_enum" NOT NULL, "planPrice" character varying NOT NULL, "requestDuration" character varying NOT NULL, CONSTRAINT "PK_4f6e9c88033106a989aa7ce9dee" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pricing"`);
        await queryRunner.query(`DROP TYPE "public"."pricing_planname_enum"`);
        await queryRunner.query(`ALTER TABLE "profile" RENAME COLUMN "userId" TO "userID"`);
    }

}
