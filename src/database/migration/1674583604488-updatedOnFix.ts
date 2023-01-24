import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedOnFix1674583604488 implements MigrationInterface {
  name = 'updatedOnFix1674583604488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_logs" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_logs" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ALTER COLUMN "updatedOn" SET DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "review" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_logs" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "logger" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "endpoint" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev_testing" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_logs" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "api" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics" ALTER COLUMN "updatedOn" DROP DEFAULT`,
    );
  }
}
