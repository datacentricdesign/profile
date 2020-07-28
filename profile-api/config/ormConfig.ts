import { ConnectionOptions } from 'typeorm';

export const ORMConfig: ConnectionOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    logging: Boolean(process.env.POSTGRES_LOGGING),
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