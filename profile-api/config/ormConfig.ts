import 'dotenv/config'
import { ConnectionOptions } from 'typeorm';

export const ORMConfig: ConnectionOptions = {
    type: 'postgres',
    host: process.env.PROFILE_POSTGRES_HOST,
    port: Number(process.env.PROFILE_POSTGRES_PORT),
    username: process.env.PROFILE_POSTGRES_USER,
    password: process.env.PROFILE_POSTGRES_PASSWORD,
    database: process.env.PROFILE_POSTGRES_DB,
    synchronize: true,
    logging: Boolean(process.env.PROFILE_POSTGRES_LOGGING),
    entities: [
        "./person/Person.ts",
        "./person/role/Role.ts",
    ],
    migrations: [
        "./person/migration/**/*.ts"
    ],
    subscribers: [
        "./person/subscriber/**/*.ts"
    ],
    // cli: {
    //     entitiesDir: "./thing/entities",
    //     migrationsDir: "./thing/migration",
    //     subscribersDir: "./thing/subscriber"
    // }
};

// module.exports = ORMConfig;