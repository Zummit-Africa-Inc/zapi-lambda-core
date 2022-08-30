import { MigrationInterface, QueryRunner } from "typeorm";

export class pricingEntity1661888425310 implements MigrationInterface {
    name = 'pricingEntity1661888425310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "planName"`);
        await queryRunner.query(`DROP TYPE "public"."pricing_planname_enum"`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "planName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "planName"`);
        await queryRunner.query(`CREATE TYPE "public"."pricing_planname_enum" AS ENUM('Basic', 'Pro', 'Mega', 'Ultra')`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "planName" "public"."pricing_planname_enum" NOT NULL`);
    }

}
