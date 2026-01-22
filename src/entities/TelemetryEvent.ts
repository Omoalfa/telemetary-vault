import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from "typeorm";

@Entity()
@Unique(["event_id"])
@Index(["timestamp"])
@Index(["source"])
export class TelemetryEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  event_id!: string;

  @Column({ type: "timestamptz" })
  timestamp!: Date;

  @Column()
  source!: string;

  @Column("jsonb")
  payload!: any;

  @CreateDateColumn()
  created_at!: Date;
}
