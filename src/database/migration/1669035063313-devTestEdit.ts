import { MigrationInterface, QueryRunner } from "typeorm";

export class devTestEdit1669035063313 implements MigrationInterface {
    name = 'devTestEdit1669035063313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cat_toy_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "catId" integer, "sizeHeight" integer NOT NULL, "sizeWidth" integer NOT NULL, "sizeLength" integer NOT NULL, CONSTRAINT "PK_ac5c1672d60b151112f65ebcf09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, "age" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "homeId" integer, "sizeHeight" integer NOT NULL, "sizeWidth" integer NOT NULL, "sizeLength" integer NOT NULL, CONSTRAINT "REL_26db7bdfb66a9c72a48e4fa285" UNIQUE ("homeId"), CONSTRAINT "PK_676cf6dbf9d1d7d216ecd87c4f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cat_home_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6bdfe5785861b7dad300f8f0ec0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "url"`);
        await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "requestStatus"`);
        await queryRunner.query(`ALTER TABLE "dev_testing" ADD "endpointId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cat_toy_entity" ADD CONSTRAINT "FK_441e45eec97723bb12d5123213a" FOREIGN KEY ("catId") REFERENCES "cat_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cat_entity" ADD CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854" FOREIGN KEY ("homeId") REFERENCES "cat_home_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cat_entity" DROP CONSTRAINT "FK_26db7bdfb66a9c72a48e4fa2854"`);
        await queryRunner.query(`ALTER TABLE "cat_toy_entity" DROP CONSTRAINT "FK_441e45eec97723bb12d5123213a"`);
        await queryRunner.query(`ALTER TABLE "dev_testing" DROP COLUMN "endpointId"`);
        await queryRunner.query(`ALTER TABLE "dev_testing" ADD "requestStatus" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dev_testing" ADD "url" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "cat_home_entity"`);
        await queryRunner.query(`DROP TABLE "cat_entity"`);
        await queryRunner.query(`DROP TABLE "cat_toy_entity"`);
    }

}
