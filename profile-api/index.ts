
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

// Connects to the Relational Database -> then starts the express
createConnection(config.orm)
    .then(async connection => {
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
        app.use("/persons", PersonRouter);
        app.use("/auth", AuthRouter);
        app.use(errorMiddleware)

        // Start listening
        app.listen(config.http.port, () => {
            console.log("Server started on port "+ config.http.port +"!");
        });

    })
    .catch(error => console.log(error));
