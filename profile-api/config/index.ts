import 'dotenv/config';

import { cleanEnv, str, port, bool, url } from "envalid";
import { envConfig } from "./envConfig";
import { ORMConfig } from "./ormConfig";
import { httpConfig } from "./httpConfig";
import { authConfig } from './authConfig';
import { Context } from '@datacentricdesign/types';

function validateEnv() {
  cleanEnv(process.env, {
    // Host folder where to store the data
    HOST_DATA_FOLDER: str(),
    // Secret to encrypt all JWT
    JWT_SECRET: str(),
    // Environment
    NODE_ENV: str(),
    DEV_USER: str(),
    DEV_TOKEN: str(),
    // Postgres Settings
    PROFILE_POSTGRES_HOST: str(),
    PROFILE_POSTGRES_USER: str(),
    PROFILE_POSTGRES_PASSWORD: str(),
    PROFILE_POSTGRES_PORT: port(),
    PROFILE_POSTGRES_DB: str(),
    PROFILE_POSTGRES_LOGGING: bool(),
    // HTTP Settings
    HTTP_HOST: str(),
    HTTP_PORT: port(),
    HTTP_SECURED: bool(),
    HTTP_BASE_URL: str(),
    // OAuth2 Settings
    OAUTH2_TOKEN_URL: url(),
    OAUTH2_REVOKE_URL: url(),
    OAUTH2_INTROSPECT_URL: url(),
    OAUTH2_CLIENT_ID: str(),
    OAUTH2_CLIENT_SECRET: str(),
    OAUTH2_SCOPE: str(),
    OAUTH2_FIRST_PARTY_APPS: str(),
    OAUTH2_HYDRA_ADMIN_URL: url(),
    ACP_URL: url(),
  });

}

validateEnv()

export default {
  homeDataFolder: process.env.HOME_DATA_FOLDER,
  jwtSecret: process.env.JWT_SECRET,
  env: envConfig,
  orm: ORMConfig,
  http: httpConfig,
  oauth2: authConfig
};

// Setup context of Request to pass user info once identified

declare global {
  namespace Express {
    interface Request {
      context: Context
    }
  }
}
