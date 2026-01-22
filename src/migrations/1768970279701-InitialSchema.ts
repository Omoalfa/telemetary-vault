import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1768970279701 implements MigrationInterface {
    name = 'InitialSchema1768970279701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "telemetry_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "source" character varying NOT NULL, "payload" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9151bbfbe297a4322e6ad27d8ce" UNIQUE ("event_id"), CONSTRAINT "PK_e90f74ced7184326072d620d188" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_602768c95d8dd6c123ba69f198" ON "telemetry_event" ("source") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0f222ddf893bd26ac1226443d" ON "telemetry_event" ("timestamp") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a0f222ddf893bd26ac1226443d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_602768c95d8dd6c123ba69f198"`);
        await queryRunner.query(`DROP TABLE "telemetry_event"`);
    }

}
