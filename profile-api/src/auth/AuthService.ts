import * as SimpleOauth from "simple-oauth2";
import { DCDError } from "@datacentricdesign/types";
import config from "../config";
import { URL } from "url";
import * as fs from "fs";
import { User } from "./User";
import {
  AdminApi,
  Configuration,
  PreviousConsentSession,
} from "@ory/hydra-client";

export interface KeySet {
  algorithm: string;
  privateKey: string;
}

export interface Scope {
  id: string;
  name: string;
  desc: string;
}

export interface Token {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
}

export interface OpenID {
  id?: string;
  sub?: string;
  username?: string;
  name?: string;
  given_name?: string;
  profile?: string;
  family_n?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_verified?: boolean;
}

/**
 * This class handle Authentication and Authorisation processes
 */
export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (AuthService.instance === undefined) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private scopeLib = JSON.parse(fs.readFileSync("scopes.json", "utf8"));

  private oauth2: SimpleOauth.ClientCredentials;
  private token: SimpleOauth.AccessToken = null;

  private hydraAdmin: AdminApi;
  private headers: Record<string, string>;

  private constructor() {
    this.headers = {
      Accept: "application/json",
    };
    if (config.http.secured) {
      this.headers["X-Forwarded-Proto"] = "https";
    }
    const params: SimpleOauth.ModuleOptions = {
      client: {
        id: config.oauth2.oAuth2ClientId,
        secret: config.oauth2.oAuth2ClientSecret,
      },
      auth: {
        tokenHost: new URL(config.oauth2.oAuth2TokenURL).origin,
        tokenPath: new URL(config.oauth2.oAuth2TokenURL).pathname,
        revokePath: new URL(config.oauth2.oAuth2RevokeURL).pathname,
      },
      http: {
        headers: this.headers,
      },
      options: {
        bodyFormat: "form",
      },
    };
    this.oauth2 = new SimpleOauth.ClientCredentials(params);

    this.hydraAdmin = new AdminApi(
      new Configuration({
        basePath: config.oauth2.oAuth2HydraAdminURL,
        accessToken: this.refreshTokenIfExpired(),
      })
    );
  }

  /**
   * @param {string} token
   * @param {Array<string>} requiredScope
   * @return {Promise<any>}
   */
  async introspect(token: string, requiredScope: string[] = []): Promise<User> {
    return this.hydraAdmin
      .introspectOAuth2Token(token, requiredScope.join(" "), {
        headers: this.headers,
      })
      .then((response) => {
        const intro = response.data;
        if (!intro.active) {
          return Promise.reject(
            new DCDError(4031, "The bearer token is not active")
          );
        }
        if (intro.token_type && intro.token_type !== "access_token") {
          return Promise.reject(
            new DCDError(4031, "The bearer token is not an access token")
          );
        }
        return Promise.resolve({
          entityId: intro.sub,
          token: token,
          sub: intro.sub,
          exp: intro.exp,
          token_type: intro.token_type,
        });
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  refreshTokenIfExpired(): Promise<string> {
    if (this.token) {
      if (this.token.expired()) {
        return this.requestNewToken();
      }
      return Promise.resolve(this.token.token.access_token);
    }

    return this.requestNewToken();
  }

  async requestNewToken(): Promise<string> {
    try {
      const result = await this.oauth2.getToken({
        scope: config.oauth2.oAuth2Scope,
      });
      this.token = this.oauth2.createToken(result);
      return Promise.resolve(this.token.token.access_token);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * List a Person's apps.
   * @param {string} personId
   * returns {Person}
   **/
  async listAPersonApps(personId: string): Promise<PreviousConsentSession[]> {
    return this.hydraAdmin
      .listSubjectConsentSessions(personId, { headers: this.headers })
      .then((response) => {
        return Promise.resolve(response.data);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  /**
   * Delete a Person's app.
   * @param {string} personId
   * returns {Person}
   **/
  async deleteAPersonApp(personId: string, clientId: string): Promise<void> {
    this.hydraAdmin
      .revokeConsentSessions(personId, clientId, true, {
        headers: this.headers,
      })
      .then(() => {
        return Promise.resolve();
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  buildDetailedScopes(scopes: string[]): Scope[] {
    const detailedScopes = [];
    for (const key in scopes) {
      if (this.scopeLib[scopes[key]]) {
        detailedScopes.push(this.scopeLib[scopes[key]]);
      } else {
        detailedScopes.push({
          id: scopes[key],
          name: scopes[key],
          desc: "",
        });
      }
    }
    return detailedScopes;
  }
}
