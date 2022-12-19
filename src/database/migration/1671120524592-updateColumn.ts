import { MigrationInterface, QueryRunner } from "typeorm";

export class updateColumn1671120524592 implements MigrationInterface {
    name = 'updateColumn1671120524592'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
    }

}
