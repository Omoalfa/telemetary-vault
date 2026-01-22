import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserEntity1769111193307 implements MigrationInterface {
    name = 'AddUserEntity1769111193307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "email" character varying NOT NULL, "api_key" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_55518b11e5013893f3b9f074209" UNIQUE ("api_key"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "telemetry_event" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "telemetry_event" ADD CONSTRAINT "FK_4ada1a05279fe3999d69e32b5f3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "telemetry_event" DROP CONSTRAINT "FK_4ada1a05279fe3999d69e32b5f3"`);
        await queryRunner.query(`ALTER TABLE "telemetry_event" DROP COLUMN "userId"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
