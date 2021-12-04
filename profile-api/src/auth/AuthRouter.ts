import { Router } from "express";

import { AuthController } from "./AuthController";

// Sets up csrf protection
import * as csrf from "csurf";
import { RequestHandler } from "express-serve-static-core";

export class AuthRouter {
  private router: Router;

  private controller: AuthController;

  private csrfProtection: RequestHandler;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.controller = AuthController.getInstance();
    this.csrfProtection = csrf({ cookie: false });
    this.setRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  getController(): AuthController {
    return this.controller;
  }

  setRoutes(): void {
    /**
     * @api {get} /auth/health
     * @apiGroup Auth
     * @apiDescription Get Health status of Auth API
     *
     * @apiVersion 0.1.2
     *
     * @apiSuccess {object} health status
     **/
    this.router.get("/health", this.controller.apiHealth.bind(this.controller));

    /**
     * @api {get} /auth/sign Get Sign information
     * @apiGroup Auth
     **/
    this.router.get(
      "/signin",
      this.csrfProtection,
      this.controller.getSignIn.bind(this.controller)
    );

    /**
     * @api {post} /auth/sign Post Sign in validation
     * @apiGroup Auth
     **/
    this.router.post(
      "/signin",
      /*this.csrfProtection,*/
      this.controller.postSignIn.bind(this.controller)
    );

    /**
     * @api {get} /auth/signup Get Sign up information
     * @apiGroup Auth
     **/
    this.router.get(
      "/signup",
      this.csrfProtection,
      this.controller.getSignUp.bind(this.controller)
    );

    /**
     * @api {post} /auth/signup Post Sign up validation
     * @apiGroup Auth
     **/
    this.router.post(
      "/signup",
      /*this.csrfProtection,*/
      this.controller.postSignUp.bind(this.controller)
    );

    /**
     * @api {get} /auth/signout Get Sign out
     * @apiGroup Auth
     **/
    this.router.post(
      "/signout",
      this.csrfProtection,
      this.controller.getSignOut.bind(this.controller)
    );

    /**
     * @api {post} /auth/signout Post Sign out
     * @apiGroup Auth
     **/
    this.router.post(
      "/signout",
      this.csrfProtection,
      this.controller.postSignOut.bind(this.controller)
    );

    /**
     * @api {get} /auth/consent Get consent
     * @apiGroup Auth
     **/
    this.router.get(
      "/consent",
      this.csrfProtection,
      this.controller.getConsent.bind(this.controller)
    );

    /**
     * @api {post} /auth/consent Post consent
     * @apiGroup Auth
     **/
    this.router.post(
      "/consent",
      /*this.csrfProtection,*/
      this.controller.postConsent.bind(this.controller)
    );
  }
}
