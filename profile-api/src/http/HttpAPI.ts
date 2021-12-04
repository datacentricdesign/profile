import config from "../config";

import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { Server } from "http";

import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import * as session from "express-session";

import { Log } from "../Logger";
import { DCDError } from "@datacentricdesign/types";
import { PersonRouter } from "../person/PersonRouter";
import { AuthRouter } from "../auth/AuthRouter";
import { GroupRouter } from "../group/GroupRouter";

export class HttpAPI {
  app: express.Application;
  server: Server;

  personRouter: PersonRouter;
  groupRouter: GroupRouter;
  authRouter: AuthRouter;

  constructor() {
    // Create a new express application instance
    this.app = express();

    // Call middleware
    this.app.use(cors());
    this.app.use(helmet());

    this.app.use(
      session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
      })
    );

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    this.app.get(config.http.baseUrl + "/", (req: Request, res: Response) => {
      return res.status(200).send({ status: "OK" });
    });

    // Set all routes from routes folder
    this.personRouter = new PersonRouter();
    this.app.use(
      config.http.baseUrl + "/persons",
      this.personRouter.getRouter()
    );

    this.groupRouter = new GroupRouter();
    this.app.use(config.http.baseUrl + "/groups", this.groupRouter.getRouter());

    this.authRouter = new AuthRouter();
    this.app.use(config.http.baseUrl + "/auth", this.authRouter.getRouter());

    this.app.use(
      config.http.baseUrl + "/docs",
      express.static("dist/public/docs/rest")
    );

    this.app.use(
      (request: Request, response: Response, next: NextFunction): void => {
        next(new DCDError(404, "This URL does not match any Profile API."));
      }
    );

    this.app.use(this.errorHandler);
  }

  public async start(): Promise<void> {
    this.server = this.app.listen(config.http.port, () => {
      Log.info("HTTP Server started on port " + config.http.port + ".");
      return Promise.resolve();
    });
  }

  public async stop(): Promise<void> {
    this.server.close((error: Error) => {
      if (error !== undefined) {
        Log.error(error);
        return Promise.reject(error);
      } else {
        return Promise.resolve();
      }
    });
  }

  public errorHandler(
    error: DCDError,
    request: Request,
    response: Response
  ): void {
    Log.debug("Error on route: " + request.originalUrl);
    const status = error._statusCode || 500;
    const message = error.message || "Something went wrong";
    Log.debug(
      JSON.stringify({
        status,
        message,
        name: error.name,
        hint: error._hint,
        requirements: error._requirements,
        stack: error.stack,
        code: error.errorCode,
      })
    );
    if (config.env.env === "development") {
      response.status(status).send({
        status,
        message,
        name: error.name,
        hint: error._hint,
        requirements: error._requirements,
        stack: error.stack,
        code: error.errorCode,
      });
    } else {
      response.status(status).send({
        status,
        message,
        name: error.name,
        hint: error._hint,
        requirements: error._requirements,
      });
    }
  }
}
