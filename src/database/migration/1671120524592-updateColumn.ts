import { MigrationInterface, QueryRunner } from "typeorm";

export class updateColumn1671120524592 implements MigrationInterface {
    name = 'updateColumn1671120524592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cat_toy_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "catId" integer, CONSTRAINT "PK_ac5c1672d60b151112f65ebcf09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, "age" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "homeId" integer, CONSTRAINT "REL_26db7bdfb66a9c72a48e4fa285" UNIQUE ("homeId"), CONSTRAINT "PK_676cf6dbf9d1d7d216ecd87c4f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_home_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6bdfe5785861b7dad300f8f0ec0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "category" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "api" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "analytics_logs" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "discussion" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "dev_testing" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "endpoint" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "logger" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "review" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "cat_toy_entity" ADD CONSTRAINT "FK_441e45eec97723bb12d5123213a" FOREIGN KEY ("catId") REFERENCES "cat_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cat_entity" ADD CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854" FOREIGN KEY ("homeId") REFERENCES "cat_home_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cat_entity" DROP CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854"`);
        await queryRunner.query(`ALTER TABLE "cat_toy_entity" DROP CONSTRAINT "FK_441e45eec97723bb12d5123213a"`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "logger" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "endpoint" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "discussion" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "analytics_logs" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "updated_at"`);
        await queryRunner.query(`DROP TABLE "cat_home_entity"`);
        await queryRunner.query(`DROP TABLE "cat_entity"`);
        await queryRunner.query(`DROP TABLE "cat_toy_entity"`);
    }

}
