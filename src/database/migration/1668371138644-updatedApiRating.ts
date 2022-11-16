import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedApiRating1668371138644 implements MigrationInterface {
    name = 'updatedApiRating1668371138644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "api" ADD "rating" numeric(3,1) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "api" ADD "rating" integer NOT NULL DEFAULT '0'`);
    }

}
