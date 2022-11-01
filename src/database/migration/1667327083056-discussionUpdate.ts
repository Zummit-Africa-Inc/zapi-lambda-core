import { MigrationInterface, QueryRunner } from "typeorm";

export class discussionUpdate1667327083056 implements MigrationInterface {
    name = 'discussionUpdate1667327083056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discussion" ADD "profile_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "profile_id" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "profile_id"`);
        await queryRunner.query(`ALTER TABLE "discussion" DROP COLUMN "profile_id"`);
    }

}
