import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { TelemetryEvent } from "./TelemetryEvent";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  api_key!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => TelemetryEvent, (event) => event.user)
  events!: TelemetryEvent[];
}
