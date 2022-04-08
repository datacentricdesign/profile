import { Request, Response, NextFunction } from "express";

import config, { DCDRequest } from "../config";

import { AccessToken, ClientCredentials } from "simple-oauth2";
import { AdminApi, Configuration, OAuth2Client } from "@ory/hydra-client"


export class AppController {
  private static instance: AppController;

  public static getInstance(): AppController {
    if (AppController.instance === undefined) {
      AppController.instance = new AppController();
    }
    return AppController.instance;
  }

  private hydraAdminApi: AdminApi
  private oauth2: ClientCredentials;
  private token: AccessToken = null;


  private constructor() {
    this.hydraAdminApi = new AdminApi(new Configuration({
      basePath: config.oauth2.oAuth2HydraAdminURL,
      accessToken: this.refreshTokenIfExpired(),
    }))
  }

  async listApps(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result: any = await this.hydraAdminApi.listOAuth2Clients()
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createAnApp(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result: any = await this.hydraAdminApi.createOAuth2Client(req.body);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteAnApp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const appId: string = req.params.appId;
    try {
      const result: any = await this.hydraAdminApi.deleteOAuth2Client(appId)
      res.status(204).send();
    } catch (error) {
      next(error);
    }
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
}
