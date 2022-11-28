import { MigrationInterface, QueryRunner } from "typeorm";

export class reviewUpdate1669615535652 implements MigrationInterface {
    name = 'reviewUpdate1669615535652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" ADD "reviewer" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "reviewer"`);
    }

}
