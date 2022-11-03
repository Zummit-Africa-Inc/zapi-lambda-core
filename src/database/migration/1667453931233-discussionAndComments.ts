import { MigrationInterface, QueryRunner } from "typeorm";

export class discussionAndComments1667453931233 implements MigrationInterface {
    name = 'discussionAndComments1667453931233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        //await queryRunner.query(`CREATE TABLE "cat_toy_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "catId" integer, CONSTRAINT "PK_ac5c1672d60b151112f65ebcf09" PRIMARY KEY ("id"))`);
        //await queryRunner.query(`CREATE TABLE "cat_home_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6bdfe5785861b7dad300f8f0ec0" PRIMARY KEY ("id"))`);
        //await queryRunner.query(`CREATE TABLE "cat_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, "age" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "homeId" integer, CONSTRAINT "REL_26db7bdfb66a9c72a48e4fa285" UNIQUE ("homeId"), CONSTRAINT "PK_676cf6dbf9d1d7d216ecd87c4f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discussion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "api_id" character varying NOT NULL, "comments" text array DEFAULT '{}', "title" character varying NOT NULL, "body" character varying NOT NULL, "profile_id" character varying NOT NULL, CONSTRAINT "PK_b93169eb129e530c6a4c3b9fda1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "discussion_id" character varying NOT NULL, "body" character varying NOT NULL, "is_parent" boolean NOT NULL DEFAULT false, "child_comment_ids" text array DEFAULT '{}', "profile_id" character varying NOT NULL, "discussionId" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        //await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "discussion_id" character varying NOT NULL, "body" character varying NOT NULL, "is_parent" boolean NOT NULL DEFAULT false, "child_comment_ids" text array, "profile_id" character varying NOT NULL, "discussionId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        //await queryRunner.query(`ALTER TABLE "discussion" DROP COLUMN "comments"`);
        //await queryRunner.query(`ALTER TABLE "discussion" ADD "comments" text array DEFAULT '{}'`);
        //await queryRunner.query(`ALTER TABLE "discussion" ADD "comment_ids" text array`);
        //await queryRunner.query(`ALTER TABLE "cat_toy_entity" ADD CONSTRAINT "FK_441e45eec97723bb12d5123213a" FOREIGN KEY ("catId") REFERENCES "cat_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        //await queryRunner.query(`ALTER TABLE "cat_entity" ADD CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854" FOREIGN KEY ("homeId") REFERENCES "cat_home_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_439477beb3a538163fbec09f144" FOREIGN KEY ("discussionId") REFERENCES "discussion"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        //await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_ab2d64b5b3f541b5ddf76971cfd" FOREIGN KEY ("discussionId") REFERENCES "discussion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_ab2d64b5b3f541b5ddf76971cfd"`);
        //await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_439477beb3a538163fbec09f144"`);
        //await queryRunner.query(`ALTER TABLE "cat_entity" DROP CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854"`);
        //await queryRunner.query(`ALTER TABLE "cat_toy_entity" DROP CONSTRAINT "FK_441e45eec97723bb12d5123213a"`);
        //await queryRunner.query(`ALTER TABLE "discussion" DROP COLUMN "comment_ids"`);
        //await queryRunner.query(`ALTER TABLE "discussion" DROP COLUMN "comments"`);
        //await queryRunner.query(`ALTER TABLE "discussion" ADD "comments" text array DEFAULT '{}'`);
        //await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "discussion"`);
        //await queryRunner.query(`DROP TABLE "cat_entity"`);
        //await queryRunner.query(`DROP TABLE "cat_home_entity"`);
        //await queryRunner.query(`DROP TABLE "cat_toy_entity"`);
    }

}
