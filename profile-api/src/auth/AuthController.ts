import { Request, Response, NextFunction, RequestHandler } from "express";
import * as url from "url";

import { WebsocketRequestHandler } from "express-ws";
import * as ws from "ws";

import { PersonService } from "../person/PersonService";

import { hydra } from "./hydra";
import config, { DCDRequest } from "../config";
import { DCDError, DTOPerson } from "@datacentricdesign/types";

// Read scopes
import { PolicyService } from "../policy/PolicyService";
import { AuthService, OpenID } from "./AuthService";
import { Log } from "../Logger";
import { User } from "./User";

export class AuthController {
  private static instance: AuthController;

  public static getInstance(): AuthController {
    if (AuthController.instance === undefined) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  private authService: AuthService;
  private policyService: PolicyService;
  private personService: PersonService;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.policyService = PolicyService.getInstance();
    this.personService = PersonService.getInstance();
  }

  async apiHealth(req: Request, res: Response): Promise<void> {
    res.send({ status: "OK" });
  }

  /**
   * Introspect the token from the 'Authorization' HTTP header to
   * determined if it is valid and who it belongs to.
   */
  authenticate(requiredScope: string[]): RequestHandler {
    return async (
      req: DCDRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      return this._authenticate(requiredScope, req, next);
    };
  }

  authenticateWs(requiredScope: string[]): WebsocketRequestHandler {
    return async (
      ws: ws,
      req: DCDRequest,
      next: NextFunction
    ): Promise<void> => {
      return this._authenticate(requiredScope, req, next);
    };
  }

  async _authenticate(
    requiredScope: string[],
    req: DCDRequest,
    next: NextFunction
  ): Promise<void> {
    if (requiredScope.length === 0) {
      requiredScope = ["dcd:persons"];
    }
    try {
      const token = extractToken(req);
      const user: User = await this.authService.introspect(
        token,
        requiredScope
      );
      req.context = {
        userId: user.sub,
      };
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sign in - Get info
   */
  async getSignIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Parses the URL query
    const query = url.parse(req.url, true).query;

    // The challenge is used to fetch information
    // about the login request from ORY Hydra.
    const challenge = query.login_challenge;

    hydra
      .getLoginRequest(challenge)
      // This will be called if the HTTP request was successful
      .then((response) => {
        // If hydra was already able to authenticate the user,
        // skip will be true and we do not need to re-authenticate
        // the user.
        if (response.skip) {
          // You can apply logic here, for example update
          // the number of times the user logged in.

          // Now it's time to grant the login request. You could also
          // deny the request if something went terribly wrong
          // (e.g. your arch-enemy logging in...)
          return (
            hydra
              // Confirm we indeed want to log in the user
              .acceptLoginRequest(challenge, {
                subject: response.subject,
              })
              // Redirect the user back to hydra
              .then((response) => {
                res.json({
                  redirect_to: response.redirect_to,
                });
              })
          );
        }

        res.json({
          baseUrl: config.http.baseUrl,
          csrfToken: req.csrfToken(),
          challenge: challenge,
          error: {},
          client: response.client,
        });
      })
      // This will handle any error that happens
      // when making HTTP calls to hydra
      .catch((error) => next(error));
  }

  /**
   * Sign in - Post info
   */
  async postSignIn(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // The challenge is now a hidden input field,
    // so let's take it from the request body instead
    this.personService
      .checkPerson(req.body.email, req.body.password)
      .then((userId) => {
        // Tell hydra to login this user
        if (userId !== undefined) {
          req.context = {
            userId: userId,
          };
          login(req, res, next);
        } else {
          // Invalid user credentials, show the ui again
          const jsonError = {
            message: "The email / password combination is not correct",
          };

          res.json({
            baseUrl: config.http.baseUrl,
            // csrfToken: req.csrfToken(),
            challenge: req.body.challenge,
            error: jsonError,
          });
        }
      })
      .catch((error) => {
        Log.error(error);
        next(error);
      });
  }

  /**
   * Sign up - Get info
   */
  async getSignUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Parses the URL query
    const query = url.parse(req.url, true).query;

    // The challenge is used to fetch information
    // about the login request from ORY Hydra.
    const challenge = query.login_challenge;

    hydra
      .getLoginRequest(challenge)
      // This will be called if the HTTP request was successful
      .then((response) => {
        // If hydra was already able to authenticate the user,
        // skip will be true and we do not need to re-authenticate
        // the user.
        if (response.skip) {
          // Now it's time to grant the login request. You could also
          // deny the request if something went terribly wrong
          return hydra
            .acceptLoginRequest(challenge, {
              // All we need to do is to confirm that we indeed
              // want to log in the user.
              subject: response.subject,
            })
            .then((response) => {
              // All we need to do now is to redirect the user
              // back to hydra!
              res.json({
                redirect_to: response.redirect_to,
              });
            });
        }

        // If authentication can't be skipped
        // we MUST show the sign up UI.
        res.json({
          baseUrl: config.http.baseUrl,
          csrfToken: req.csrfToken(),
          challenge: challenge,
          error: {},
          client: response.client,
        });
      })
      // This will handle any error that happens
      // when making HTTP calls to hydra
      .catch((error) => next(error));
  }

  /**
   * Sign up - Post info
   */
  async postSignUp(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const person: DTOPerson = {
      id: req.body.id,
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    };
    this.personService
      .createNewPerson(person)
      .then((person) => {
        req.context = {
          userId: person.id,
        };
        login(req, res, next);
      })
      .catch((error) => {
        res.json({
          baseUrl: config.http.baseUrl,
          // csrfToken: req.csrfToken(),
          challenge: req.body.challenge,
          error: error,
        });
      });
  }

  /**
   * Get Sign out
   */
  async getSignOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Parses the URL query
    const query = url.parse(req.url, true).query;

    // The challenge is used to fetch information about the logout request from ORY Hydra.
    const challenge = query.logout_challenge;

    hydra
      .getLogoutRequest(challenge)
      // This will be called if the HTTP request was successful
      .then(() => {
        // Here we have access to e.g. response.subject, response.sid, ...

        // The most secure way to perform a logout request is by asking the user if he/she really want to log out.
        res.json({
          csrfToken: req.csrfToken(),
          challenge: challenge,
        });
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch((error) => next(error));
  }

  /**
   * Post Sign out
   */
  async postSignOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // The challenge is now a hidden input field, so let's take it from the request body instead
    const challenge = req.body.challenge;

    if (req.body.submit === "No") {
      return (
        hydra
          .rejectLogoutRequest(challenge)
          .then(function () {
            // The user did not want to log out. Let's redirect him back somewhere or do something else.
            res.json({
              redirect_to: "https://dwd.tudelft.nl",
            });
          })
          // This will handle any error that happens when making HTTP calls to hydra
          .catch(function (error) {
            next(error);
          })
      );
    }

    // The user agreed to log out, let's accept the logout request.
    hydra
      .acceptLogoutRequest(challenge)
      .then(function (response) {
        // All we need to do now is to redirect the user back to hydra!
        res.json({
          redirect_to: response.redirect_to,
        });
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch((error) => next(error));
  }

  /**
   * Consent - display
   */
  async getConsent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Parses the URL query
    const query = url.parse(req.url, true).query;

    // The challenge is used to fetch information
    // about the consent request from ORY Hydra.
    const challenge = query.consent_challenge;

    hydra
      .getConsentRequest(challenge)
      // This will be called if the HTTP request was successful
      .then((response) => {
        // If a user has granted this application the requested scope,
        // hydra will tell us to not show the UI.
        if (
          response.skip ||
          config.oauth2.firstPartyApps.includes(response.client.client_id)
        ) {
          // You can apply logic here, for example grant
          // another scope, or do whatever...

          // If consent can't be skipped we MUST show the consent UI.
          return this.personService
            .getOnePersonById(response.subject)
            .then((person) => {
              // Now it's time to grant the consent request. You could also
              // deny the request if something went terribly wrong
              return hydra
                .acceptConsentRequest(challenge, {
                  // We can grant all scopes that have been requested,
                  // hydra already checked for us that no additional scopes
                  // are requested accidentally.
                  grant_scope: response.requested_scope,

                  grant_access_token_audience:
                    response.requested_access_token_audience,

                  // The session allows us to set session data
                  // for id and access tokens
                  session: {
                    // This data will be available when introspecting
                    // the token. Try to avoid sensitive information here,
                    // unless you limit who can introspect tokens.
                    // access_token: { foo: 'bar' },

                    // This data will be available in the ID token.
                    id_token: buildIDToken(response.requested_scope, person),
                  },
                })
                .then((response) => {
                  // All we need to do now is to redirect the
                  // user back to hydra!
                  res.json({
                    redirect_to: response.redirect_to,
                  });
                });
            });
        }

        // If consent can't be skipped we MUST show the consent UI.
        return this.personService
          .getOnePersonById(response.subject)
          .then((person) => {
            res.json({
              baseUrl: config.http.baseUrl,
              csrfToken: req.csrfToken(),
              challenge: challenge,
              requested_scope: this.authService.buildDetailedScopes(
                response.requested_scope
              ),
              scopes: response.requested_scope.join(","),
              user: person,
              client: response.client,
            });
          });
      })
      // This will handle any error that happens
      // when making HTTP calls to hydra
      .catch((error) => next(error));
  }

  /**
   * Consent - Validation
   */
  async postConsent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // The challenge is now a hidden input field, so let's take it
    // from the request body instead
    const challenge = req.body.challenge;

    // Let's see if the user decided to accept or reject the consent request..
    if (req.body.submit === "Deny access") {
      // Looks like the consent request was denied by the user
      return (
        hydra
          .rejectConsentRequest(challenge, {
            error: "access_denied",
            error_description: "The resource owner denied the request",
          })
          .then((response) => {
            // All we need to do now is to redirect
            // the browser back to hydra!
            res.json({
              redirect_to: response.redirect_to,
            });
          })
          // This will handle any error that happens
          // when making HTTP calls to hydra
          .catch((error) => next(error))
      );
    }

    const grant_scope = req.body.scopes.split(",");
    // if (!Array.isArray(grant_scope)) {
    //   grant_scope = [grant_scope];
    // }
    // Seems like the user authenticated! Let's tell hydra...
    hydra
      .acceptConsentRequest(challenge, {
        // We can grant all scopes that have been requested,
        // hydra already checked for us that no additional scopes
        // are requested accidentally.
        grant_scope: grant_scope,

        // The session allows us to set session data for id and access tokens
        session: {
          // This data will be available when introspecting the token.
          // Try to avoid sensitive information here,
          // unless you limit who can introspect tokens.
          // access_token: { foo: 'bar' },

          // This data will be available in the ID token.
          id_token: buildIDToken(grant_scope, req.body.user),
        },

        // This tells hydra to remember this consent request and allow the
        // same client to request the same
        // scopes from the same user, without showing the UI, in the future.
        remember: Boolean(req.body.remember),

        // When this "remember" session expires, in seconds. Set this to 0
        // so it will never expire.
        remember_for: 3600,
      })
      .then((response) => {
        // All we need to do now is to redirect the user back to hydra!
        res.json({
          redirect_to: response.redirect_to,
        });
      })
      // This will handle any error that happens
      // when making HTTP calls to hydra
      .catch((error) => next(error));
  }
}

function login(req: DCDRequest, res: Response, next: NextFunction): void {
  // Seems like the user authenticated! Let's tell hydra...
  hydra
    .acceptLoginRequest(req.body.challenge, {
      // Subject is an alias for user ID. A subject can be a random string,
      // a UUID, an email address, ....
      subject: req.context.userId,

      // This tells hydra to remember the browser and automatically
      // set the "skip" parameter in the other
      // route to true on subsequent requests!
      remember: Boolean(req.body.remember),

      // When the session expires, in seconds. Set this to 0
      // so it will never expire.
      remember_for: 3600,

      // Sets which "level" (e.g. 2-factor authentication) of
      // authentication the user has. The value is really arbitrary
      // and optional. In the context of OpenID Connect, a value
      // of 0 indicates the lowest authorization level.
      // acr: '0',
    })
    .then((response) => {
      // req.session.subject = req.subject;
      // All we need to do now is to redirect the
      // user back to hydra!
      res.json({
        redirect_to: response.redirect_to,
      });
    })
    // This will handle any error that happens when making
    // HTTP calls to hydra
    .catch((error) => next(error));

  // You could also deny the login request which tells hydra
  // that no one authenticated!
  // hydra.rejectLoginRequest(challenge, {
  //   error: 'invalid_request',
  //   error_description: 'The user did something stupid...'
  // })
  //   .then(function (response) {
  //     // All we need to do now is to
  //     // redirect the browser back to hydra!
  //     res.redirect(response.redirect_to);
  //   })
  //   // This will handle any error that happens when making
  //   // HTTP calls to hydra
  //   .catch(function (error) {
  //     next(error);
  //   });
}

function buildIDToken(grant_scope: string[], user: User): OpenID {
  const idToken: OpenID = {};
  // This is the openid 'profile' scope which should include
  // some user profile data. (optional)
  if (grant_scope.indexOf("profile") > 0) {
    idToken.id = user.id;
    idToken.sub = user.id;
    idToken.username = user.id.replace("dcd:persons:", "");
    idToken.name = user.name;
    idToken.given_name = user.name;
    idToken.profile = user.name;
    idToken.family_n = "";
  }

  // This is to fulfill the openid 'email' scope which returns
  // the user's email address. (optional)
  if (grant_scope.indexOf("email") > 0) {
    idToken.email = user.email;
    idToken.email_verified = false;
  }

  if (grant_scope.indexOf("phone") > 0) {
    idToken.phone_number = "";
    idToken.phone_verified = false;
  }
  return idToken;
}

/**
 * Check and extract the token from the header
 * @param req
 * @return {*|void|string}
 */
function extractToken(req: DCDRequest): string {
  if (req.get("Authorization") !== undefined) {
    const authorization = req.get("Authorization");
    if (
      !authorization.startsWith("bearer ") &&
      !authorization.startsWith("Bearer ")
    ) {
      throw new DCDError(
        4031,
        "Add 'bearer ' in front of your 'Authorization' token."
      );
    } else {
      return authorization.replace(/bearer\s/gi, "").replace(/Bearer\s/gi, "");
    }
  } else if (req.query.authorization !== undefined) {
    return req.query.authorization.toString();
  } else {
    throw new DCDError(4031, "Add 'Authorization' header.");
  }
}
