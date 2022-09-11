import { MigrationInterface, QueryRunner } from "typeorm";

export class analytics1662920748439 implements MigrationInterface {
    name = 'analytics1662920748439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" DROP COLUMN "subscriptionToken"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "api" text array DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "api"`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD "subscriptionToken" character varying NOT NULL`);
    }

}
