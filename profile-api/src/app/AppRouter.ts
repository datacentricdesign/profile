import { Router } from "express";
import { AuthController } from "../auth/AuthController";
import { PolicyController } from "../policy/PolicyController";

import { AppController } from "./AppController";

export class AppRouter {
  private router: Router;

  private controller: AppController;
  private policyController: PolicyController;
  private authController: AuthController;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.controller = AppController.getInstance();
    this.setRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  getController(): AppController {
    return this.controller;
  }

  setRoutes(): void {
    /**
     * @api {get} /apps List
     * @apiGroup App
     * @apiDescription List apps owned by the current user
     * @apiVersion 0.1.2
     **/
    this.router.get(
      "/",
      [this.authController.authenticate(["dcd:app"])],
      this.controller.listApps.bind(this.controller)
    );

    /**
     * @api {post} /apps Create
     * @apiGroup App
     * @apiDescription Create an app
     * @apiVersion 0.1.2
     **/
    this.router.post(
      "/",
      [this.authController.authenticate(["dcd:apps"])],
      this.controller.createAnApp.bind(this.controller)
    );

    /**
     * @api {delete} /apps/:appId Delete
     * @apiGroup App
     * @apiDescription Delete an app
     * @apiVersion 0.1.2
     **/
    this.router.delete(
      "/:appId",
      [
        this.authController.authenticate(["dcd:apps"]),
        this.policyController.checkPolicy("delete"),
      ],
      this.controller.deleteAnApp.bind(this.controller)
    );
  }
}
