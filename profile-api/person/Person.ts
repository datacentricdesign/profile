import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn, OneToMany, PrimaryColumn, JoinColumn
} from "typeorm";

import { Person as IPerson } from "../types";

/**
 * A Person represents a physical person
 */
@Entity()
export class Person implements IPerson {
    @PrimaryColumn()
    id: string;

    @Column({unique:true})
    email: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}