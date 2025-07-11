import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Organisation } from "./Organisation.js";
import { Ticket } from "./Ticket.js";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "text" })
  name;

  @Column({ type: "text", unique: true })
  email;

  @Column({ type: "text" })
  password;

  @Column({ name: "organisation_id" })
  organisationId;

  @ManyToOne(() => Organisation, organisation => organisation.users)
  @JoinColumn({ name: "organisation_id" })
  organisation;

  @OneToMany(() => Ticket, ticket => ticket.user)
  tickets;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt;
} 