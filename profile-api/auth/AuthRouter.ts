import { Router } from "express";

import AuthController from "./AuthController";

// Sets up csrf protection
import * as csrf from "csurf"
this.csrfProtection = csrf({ cookie: false });

export const AuthRouter = Router();

/**
 * @api {get} /auth/health
 * @apiGroup Auth
 * @apiDescription Get Health status of Auth API
 *
 * @apiVersion 0.1.0
 *
 * @apiSuccess {object} health status
**/
AuthRouter.get(
    "/health",
    AuthController.apiHealth);

/**
 * @api {get} /auth/sign Get Sign information
 * @apiGroup Auth
 **/
AuthRouter.get(
    "/signin",
    this.csrfProtection,
    AuthController.getSignIn)

/**
 * @api {post} /auth/sign Post Sign in validation
 * @apiGroup Auth
 **/
AuthRouter.post(
    "/signin",
    /*this.csrfProtection,*/
    AuthController.postSignIn)

/**
 * @api {get} /auth/signup Get Sign up information
 * @apiGroup Auth
 **/
AuthRouter.get(
    "/signup",
    this.csrfProtection,
    AuthController.getSignUp)

/**
 * @api {post} /auth/signup Post Sign up validation
 * @apiGroup Auth
 **/
AuthRouter.post(
    "/signup",
    /*this.csrfProtection,*/
    AuthController.postSignUp)

/**
 * @api {get} /auth/signout Get Sign out
 * @apiGroup Auth
 **/
AuthRouter.post(
    "/signout",
    this.csrfProtection,
    AuthController.getSignOut)


/**
 * @api {post} /auth/signout Post Sign out
 * @apiGroup Auth
 **/
AuthRouter.post(
    "/signout",
    this.csrfProtection,
    AuthController.postSignOut)

/**
 * @api {get} /auth/consent Get consent
 * @apiGroup Auth
 **/
AuthRouter.get(
    "/consent",
    this.csrfProtection,
    AuthController.getConsent)

/**
 * @api {post} /auth/consent Post consent
 * @apiGroup Auth
 **/
AuthRouter.post(
    "/consent",
    /*this.csrfProtection,*/
    AuthController.postConsent)
