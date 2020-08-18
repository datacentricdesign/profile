
import {createConnection} from "typeorm";

import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as cookieParser from 'cookie-parser'
import * as helmet from "helmet";
import * as cors from "cors";
import config from "./config";
import errorMiddleware from './person/middlewares/ErrorMiddleware';
import { PersonRouter } from "./person/PersonRouter";
import { AuthRouter } from "./auth/AuthRouter";
import { GroupRouter } from "./person/GroupRouter";
import { PersonService } from "./person/PersonService";
import PersonController from "./person/PersonController";
import { DTOPerson } from "@datacentricdesign/types";
import AuthController from "./auth/AuthController";


waitAndConnect(1000);

function waitAndConnect(delayMs:number) {
    // Connects to the Relational Database -> then starts the express
    createConnection(config.orm)
        .then(async connection => {
            await connection.runMigrations();
            startAPI()
        })
        // Could not connect wait and try again
        .catch((error) => {
            console.log(JSON.stringify(error));
            console.log("Retrying to connect in " + delayMs + " ms.");
            delay(delayMs).then(()=>{
                waitAndConnect(delayMs*1.5);
            })
        });
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function startAPI() {
    await init()
    // Create a new express application instance
    const app = express();

    // Call middleware
    app.use(cors());
    app.use(helmet());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
      }))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    // Set all routes from routes folder
    app.use(config.http.baseUrl + "/persons", PersonRouter);
    app.use(config.http.baseUrl + "/groups", GroupRouter);
    app.use(config.http.baseUrl + "/auth", AuthRouter);
    app.use(errorMiddleware)

    app.use(config.http.baseUrl + "/docs", express.static('dist/public/docs'))

    // Start listening
    app.listen(config.http.port, () => {
        console.log("Server started on port "+ config.http.port +"!");
    });
}

async function init() {
    const exists = await PersonController.personService.checkIfPersonIdExists("dcd:persons:admin");
    console.log(exists)
    if (!exists) {
        // Create an admin user
        const admin: DTOPerson = {
            id: "dcd:persons:admin",
            email: config.env.profileAdminEmail,
            name: "Admin",
            password: config.env.profileAdminPass
        }
        const resultGroup = await AuthController.policyService.createARole(admin.id, "dcd:groups:public", []);
        await AuthController.policyService.createARole(admin.id, "dcd:groups:user", []);
        await AuthController.policyService.createARole(admin.id, "dcd:groups:admin", [admin.id]);
        const resultCreate = await PersonController.personService.createNewPerson(admin);
    }
}