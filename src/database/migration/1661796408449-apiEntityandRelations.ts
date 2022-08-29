import { MigrationInterface, QueryRunner } from 'typeorm';

export class apiEntityandRelations1661796408449 implements MigrationInterface {
  name = 'apiEntityandRelations1661796408449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" RENAME COLUMN "subscription" TO "subscriptions"`,
    );
    await queryRunner.query(
      `CREATE TABLE "discussion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "author" character varying NOT NULL, "body" character varying NOT NULL, "apiId" uuid, CONSTRAINT "PK_b93169eb129e530c6a4c3b9fda1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "price_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "apiId" uuid, "pricingId" uuid, CONSTRAINT "REL_11608f5bfd1ff9485e35a5e36a" UNIQUE ("pricingId"), CONSTRAINT "PK_baf66b2acb03206fb76891bbb48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "apiId" uuid NOT NULL, "profileId" uuid NOT NULL, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."api_status_enum" AS ENUM('verified', 'unverified')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."api_visibility_enum" AS ENUM('public', 'private')`,
    );
    await queryRunner.query(
      `CREATE TABLE "api" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "name" character varying NOT NULL, "description" character varying NOT NULL, "base_url" character varying NOT NULL, "popularity" integer NOT NULL DEFAULT '0', "about" character varying, "subscriptions" text array DEFAULT '{}', "status" "public"."api_status_enum" NOT NULL DEFAULT 'unverified', "visibility" "public"."api_visibility_enum" NOT NULL DEFAULT 'private', "rating" integer NOT NULL DEFAULT '0', "service_level" integer NOT NULL DEFAULT '0', "latency" integer NOT NULL DEFAULT '0', "categoryId" uuid NOT NULL, "profileId" uuid NOT NULL, "secretKey" character varying, "tutorialsId" character varying, "discussionsId" character varying, "priceGroupId" character varying, CONSTRAINT "UQ_8ce91749da904c1cb16bb4e06c1" UNIQUE ("name"), CONSTRAINT "PK_12f6cbe9e79197c2bf4c79c009d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "planName"`);
    await queryRunner.query(`DROP TYPE "public"."pricing_planname_enum"`);
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "planName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion" ADD CONSTRAINT "FK_2b60252641016810191dfbb6a1e" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_group" ADD CONSTRAINT "FK_78a5352493260ea77604c25399f" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_group" ADD CONSTRAINT "FK_11608f5bfd1ff9485e35a5e36a6" FOREIGN KEY ("pricingId") REFERENCES "pricing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_0253e1137348aa4ec36b503b006" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ADD CONSTRAINT "FK_a97d009aa61e381793871969509" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ADD CONSTRAINT "FK_85a54167d077f66ff2612ebb62c" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api" DROP CONSTRAINT "FK_85a54167d077f66ff2612ebb62c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" DROP CONSTRAINT "FK_a97d009aa61e381793871969509"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_8f632af010f4f7b49d362eabbb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_0253e1137348aa4ec36b503b006"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_group" DROP CONSTRAINT "FK_11608f5bfd1ff9485e35a5e36a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_group" DROP CONSTRAINT "FK_78a5352493260ea77604c25399f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion" DROP CONSTRAINT "FK_2b60252641016810191dfbb6a1e"`,
    );
    await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "planName"`);
    await queryRunner.query(
      `CREATE TYPE "public"."pricing_planname_enum" AS ENUM('Basic', 'Pro', 'Mega', 'Ultra')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ADD "planName" "public"."pricing_planname_enum" NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "api"`);
    await queryRunner.query(`DROP TYPE "public"."api_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."api_status_enum"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
    await queryRunner.query(`DROP TABLE "price_group"`);
    await queryRunner.query(`DROP TABLE "discussion"`);
    await queryRunner.query(
      `ALTER TABLE "profile" RENAME COLUMN "subscriptions" TO "subscription"`,
    );
  }
}
