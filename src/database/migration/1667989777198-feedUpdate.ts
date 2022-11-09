import { MigrationInterface, QueryRunner } from "typeorm";

export class feedUpdate1667989777198 implements MigrationInterface {
    name = 'feedUpdate1667989777198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "title" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "title" SET NOT NULL`);
    }

}
