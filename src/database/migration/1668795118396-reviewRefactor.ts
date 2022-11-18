import { MigrationInterface, QueryRunner } from "typeorm";

export class reviewRefactor1668795118396 implements MigrationInterface {
    name = 'reviewRefactor1668795118396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" ADD "reviewer" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "reviewer"`);
    }

}
