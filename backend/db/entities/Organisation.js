import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.js";
import { Ticket } from "./Ticket.js";

@Entity("organisation")
export class Organisation {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "text" })
  name;

  @OneToMany(() => User, user => user.organisation)
  users;

  @OneToMany(() => Ticket, ticket => ticket.organisation)
  tickets;

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt;
} 