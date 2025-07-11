import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User.js";
import { Organisation } from "./Organisation.js";

@Entity("tickets")
export class Ticket {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "text" })
  title;

  @Column({ type: "text", nullable: true })
  description;

  @Column({ type: "text", default: "open" })
  status;

  @Column({ name: "user_id" })
  userId;

  @Column({ name: "organisation_id" })
  organisationId;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  @ManyToOne(() => User, user => user.tickets)
  @JoinColumn({ name: "user_id" })
  user;

  @ManyToOne(() => Organisation, organisation => organisation.tickets)
  @JoinColumn({ name: "organisation_id" })
  organisation;
} 