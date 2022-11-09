import { MigrationInterface, QueryRunner } from "typeorm";

export class discussionAndCommentRefactor1667477243774 implements MigrationInterface {
    name = 'discussionAndCommentRefactor1667477243774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "discussion_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "discussion_id" SET NOT NULL`);
    }

}
