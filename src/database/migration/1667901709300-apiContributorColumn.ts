import { MigrationInterface, QueryRunner } from "typeorm";

export class apiContributorColumn1667901709300 implements MigrationInterface {
    name = 'apiContributorColumn1667901709300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api" ADD "contributors" text array DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "contributors"`);
    }

}
