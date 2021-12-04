import fetch from "node-fetch";
import { RequestInit } from "node-fetch";
import * as qs from "querystring";
import * as SimpleOauth from "simple-oauth2";
import { DCDError } from "@datacentricdesign/types";
import { PolicyService } from "../policy/PolicyService";
import config from "../config";
import { URL } from "url";
import * as fs from "fs";
import { Log } from "../Logger";
import { User } from "./User";

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

interface IntrospectionResult {
  active: boolean;
  aud: string[];
  client_id: string;
  exp: number;
  ext: Record<string, unknown>;
  iat: number;
  iss: string;
  nbf: number;
  obfuscated_subject: string;
  scope: string;
  sub: string;
  token_type: string;
  username: string;
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
  private token = null;
  private jwtTokenMap = [];
  private policyService: PolicyService;

  private constructor() {
    this.policyService = PolicyService.getInstance();
    const header = {
      Accept: "application/json",
    };
    if (config.http.secured) {
      header["X-Forwarded-Proto"] = "https";
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
        headers: header,
      },
      options: {
        bodyFormat: "form",
      },
    };
    this.oauth2 = new SimpleOauth.ClientCredentials(params);
  }

  /**
   * @param {string} token
   * @param {Array<string>} requiredScope
   * @return {Promise<any>}
   */
  async introspect(token: string, requiredScope: string[] = []): Promise<User> {
    const body = { token: token, scope: requiredScope.join(" ") };
    const url = config.oauth2.oAuth2IntrospectURL;

    try {
      const result: IntrospectionResult = await this.authorisedRequest(
        "POST",
        url,
        body,
        "application/x-www-form-urlencoded"
      );
      if (!result.active) {
        return Promise.reject(
          new DCDError(4031, "The bearer token is not active")
        );
      }
      if (result.token_type && result.token_type !== "access_token") {
        return Promise.reject(
          new DCDError(4031, "The bearer token is not an access token")
        );
      }
      return Promise.resolve({
        entityId: result.sub,
        token: token,
        sub: result.sub,
        exp: result.exp,
        token_type: result.token_type,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  refreshTokenIfExpired(): Promise<void> {
    if (this.token) {
      if (this.token.expired()) {
        return this.requestNewToken();
      }
      return Promise.resolve();
    }
    return this.requestNewToken();
  }

  async requestNewToken(): Promise<void> {
    try {
      const result = await this.oauth2.getToken({
        scope: config.oauth2.oAuth2Scope,
      });
      this.token = this.oauth2.createToken(result);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getBearer(): string {
    return "bearer " + qs.escape(this.token.token.access_token);
  }

  /**
   * Build HTTP request with token and return the result.
   * @param {String} method
   * @param {String} url
   * @param {Object} body (optional)
   * @param {String} type (default: application/json)
   * @returns {Promise}
   */
  private async authorisedRequest(
    method: string,
    url: string,
    body: Record<string, unknown> = null,
    type = "application/json"
  ) {
    try {
      // Ensure a valid token before building the request
      await this.refreshTokenIfExpired();
      const options: RequestInit = {
        headers: {
          Authorization: this.getBearer(),
          "Content-Type": type,
          Accept: "application/json",
        },
        method: method,
        timeout: 15000,
      };
      if (config.http.secured) {
        options.headers["X-Forwarded-Proto"] = "https";
      }
      if (body !== null) {
        let bodyStr = "";
        if (type === "application/x-www-form-urlencoded") {
          bodyStr = qs.stringify(body as qs.ParsedUrlQueryInput);
        } else {
          bodyStr = JSON.stringify(body);
        }
        options.headers["Content-Length"] = bodyStr.length;
        options.body = bodyStr;
      }
      const result = await fetch(url, options);
      if (result.ok) {
        return result.json();
      }
      return Promise.reject(new DCDError(result.status, result.statusText));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * List a Person's apps.
   * @param {string} personId
   * returns {Person}
   **/
  async listAPersonApps(personId: string) {
    const url =
      config.oauth2.oAuth2HydraAdminURL +
      "/oauth2/auth/sessions/consent?subject=" +
      personId;
    const res = await fetch(url, { headers: { "X-Forwarded-Proto": "https" } });
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network related
      // (network related errors are handled automatically)
      const error = await res.json();
      Log.error(
        "An error occurred while making a HTTP request: " +
          JSON.stringify(error)
      );
      return Promise.reject(new Error(error.error.message));
    }
    const result = await res.json();
    for (let i = 0; i < result.length; i++) {
      result[i].consent_request.requested_scope = this.buildDetailedScopes(
        result[i].consent_request.requested_scope
      );
    }
    return Promise.resolve(result);
  }

  /**
   * Delete a Person's app.
   * @param {string} personId
   * returns {Person}
   **/
  async deleteAPersonApp(personId: string, clientId: string) {
    const url =
      config.oauth2.oAuth2HydraAdminURL +
      "/oauth2/auth/sessions/consent?subject=" +
      personId +
      "&client=" +
      clientId;
    const res = await fetch(url, {
      headers: { "X-Forwarded-Proto": "https" },
      method: "DELETE",
    });
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network related
      // (network related errors are handled automatically)
      const error = await res.json();
      Log.error(
        "An error occurred while making a HTTP request: " +
          JSON.stringify(error)
      );
      return new Error(error.error.message);
    }
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
