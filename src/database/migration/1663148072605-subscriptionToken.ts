import { MigrationInterface, QueryRunner } from "typeorm";

export class subscriptionToken1663148072605 implements MigrationInterface {
    name = 'subscriptionToken1663148072605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" ADD "subscriptionToken" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" DROP COLUMN "subscriptionToken"`);
    }

}
