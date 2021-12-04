import config from "./config";
import { Log } from "./Logger";

import { Connection, createConnection, Migration } from "typeorm";

import { HttpAPI } from "./http/HttpAPI";
import { DTOPerson } from "@datacentricdesign/types";
import { PersonService } from "./person/PersonService";
import { PolicyService } from "./policy/PolicyService";

export class Profile {
  httpAPI: HttpAPI;

  connectionSQLDb: Connection;

  private personService: PersonService;
  private policyService: PolicyService;

  constructor() {
    Log.init("Profile");
    this.personService = PersonService.getInstance();
    this.policyService = PolicyService.getInstance();
    this.init();
    this.initHTTP();
  }

  async start(delayMs = 1000): Promise<void> {
    const sqlPromise = this.connectSQLDb().catch((error: Error) => {
      // Could not connect wait and try again
      Log.debug(JSON.stringify(error));
      Log.info("Retrying to connect in " + delayMs + " ms.");
      delay(delayMs).then(() => {
        return this.connectSQLDb();
      });
    });

    // When both Database connections are established
    Promise.all([sqlPromise]).then(() => {
      this.startHTTP();
    });
  }

  stop(): Promise<[void, void]> {
    return Promise.all([this.stopHTTP(), this.disconnectSQLDb()]);
  }

  async connectSQLDb(): Promise<void> {
    Log.info("Connecting SQL Database...");
    return createConnection(config.orm)
      .then((connection: Connection) => {
        Log.info("Running SQL Migrations...");
        this.connectionSQLDb = connection;
        return this.connectionSQLDb.runMigrations();
      })
      .then((migrations: Migration[]) => {
        Log.info("Migrations applied: " + migrations.length);
        return Promise.resolve();
      })
      .catch((error: Error) => {
        Log.error("Error while connecting and migrating the SQL database:");
        Log.error(error);
        return Promise.reject(error);
      });
  }

  disconnectSQLDb(): Promise<void> {
    Log.info("Disconnecting SQL Database...");
    return this.connectionSQLDb
      .close()
      .then(() => {
        Log.info("SQL Database disconnected.");
        return Promise.resolve();
      })
      .catch((error: Error) => {
        Log.error("Error while disconnecting the SQL database:");
        Log.error(error);
        return Promise.reject(error);
      });
  }

  initHTTP(): void {
    Log.info("Initialising HTTP API...");
    this.httpAPI = new HttpAPI();
  }

  startHTTP(): Promise<void> {
    Log.info("Starting HTTP API...");
    return this.httpAPI
      .start()
      .then(() => {
        Log.info("HTTP API started.");
        return Promise.resolve();
      })
      .catch((error: Error) => {
        Log.error("Error while starting HTTP API:");
        Log.error(error);
        return Promise.reject(error);
      });
  }

  stopHTTP(): Promise<void> {
    Log.info("Stopping HTTP...");
    return this.httpAPI
      .stop()
      .then(() => {
        Log.info("HTTP API stopped.");
        return Promise.resolve();
      })
      .catch((error: Error) => {
        Log.error("Error while stopping HTTP API:");
        Log.error(error);
        return Promise.reject(error);
      });
  }

  async init(): Promise<void> {
    const exists = await this.personService.checkIfPersonIdExists(
      "dcd:persons:admin"
    );
    Log.debug(exists);
    if (!exists) {
      // Create an admin user
      const admin: DTOPerson = {
        id: "dcd:persons:admin",
        email: config.env.profileAdminEmail,
        name: "Admin",
        password: config.env.profileAdminPass,
      };
      await this.policyService.createARole(admin.id, "dcd:groups:public", []);
      await this.policyService.createARole(admin.id, "dcd:groups:user", []);
      await this.policyService.createARole(admin.id, "dcd:groups:admin", [
        admin.id,
      ]);
      await this.personService.createNewPerson(admin);
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
