import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
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
} 