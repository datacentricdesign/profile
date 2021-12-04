import { Router } from "express";

import { AuthController } from "../auth/AuthController";
import { PolicyController } from "../policy/PolicyController";

import { PersonController } from "./PersonController";
import { NotificationRouter } from "./notification/NotificationRouter";

export class PersonRouter {
  private router: Router;

  private controller: PersonController;
  private policyController: PolicyController;
  private authController: AuthController;

  private notificationRouter: NotificationRouter;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.controller = PersonController.getInstance();
    this.policyController = PolicyController.getInstance();
    this.authController = AuthController.getInstance();
    this.setRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  getController(): PersonController {
    return this.controller;
  }

  setRoutes(): void {
    /**
     * @api {get} /persons/health
     * @apiGroup Person
     * @apiDescription Get Health status of Persons API
     *
     * @apiVersion 0.1.2
     *
     * @apiSuccess {object} health status
     **/
    this.router.get("/health", this.controller.apiHealth.bind(this.controller));

    /**
     * @api {get} /persons/:personId Read
     * @apiGroup Person
     * @apiDescription Get one Person.
     *
     * @apiVersion 0.1.2
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} persongId Id of the Person to read.
     *
     * @apiSuccess {object} person The retrieved Person
     **/
    this.router.get(
      "/:personId",
      [
        this.authController.authenticate(["dcd:persons"]),
        this.policyController.checkPolicy("read"),
      ],
      this.controller.getOnePersonById.bind(this.controller)
    );

    /**
     * @api {get} /persons/:personId Check
     * @apiGroup Person
     * @apiDescription Check is a person id already exist.
     *
     * @apiVersion 0.1.2
     *
     * @apiParam {String} persongId Id of the Person to read.
     *
     * @apiSuccess {object} person The retrieved Person
     **/
    this.router.get(
      "/:personId/check",
      this.controller.checkIfPersonIdExists.bind(this.controller)
    );

    /**
     * @api {post} /persons Create
     * @apiGroup Person
     * @apiDescription Create a new Person.
     *
     * @apiVersion 0.1.2
     *
     * @apiParam (Body) {Person} person Person to create as JSON.
     * @apiParamExample {json} person:
     *     {
     *       "id": "johndoe",
     *       "name": "John Doe",
     *       "email": "lab@datacentricdesign.org",
     *       "password": "MyStrongPassword"
     *     }
     *
     * @apiHeader {String} Content-type application/json
     *
     * @apiSuccess {object} person The created Person
     **/
    this.router.post(
      "/",
      this.controller.createNewPerson.bind(this.controller)
    );

    /**
     * @api {patch} /persons/:personId Update
     * @apiGroup Person
     * @apiDescription Edit one Person.
     *
     * @apiVersion 0.1.2
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} personId Id of the Person to update.
     **/
    this.router.patch(
      "/:personId",
      [
        this.authController.authenticate(["dcd:persons"]),
        this.policyController.checkPolicy("update"),
      ],
      this.controller.editPerson.bind(this.controller)
    );

    /**
     * @api {delete} /persons/:personId Delete
     * @apiGroup Person
     * @apiDescription Delete one Person.
     *
     * @apiVersion 0.1.2
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} persongId Id of the Person to delete.
     **/
    this.router.delete(
      "/:personId",
      [
        this.authController.authenticate(["dcd:persons"]),
        this.policyController.checkPolicy("delete"),
      ],
      this.controller.deleteOnePerson.bind(this.controller)
    );

    /**
     * @api {get} /persons/:personId/apps List
     * @apiGroup Apps
     * @apiDescription List apps' sessions
     *
     * @apiVersion 0.1.2
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} personId
     *
     * @apiReturn {String} array of app sessions.
     **/
    this.router.get(
      "/:personId/apps",
      [
        this.authController.authenticate(["dcd:persons", "dcd:apps"]),
        this.policyController.checkPolicy("read"),
      ],
      this.controller.listAPersonApps.bind(this.controller)
    );

    /**
     * @api {get} /persons/:personId/apps/:appId Revoke
     * @apiGroup Apps
     * @apiDescription Revoke app access
     *
     * @apiVersion 0.1.2
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} personId
     * @apiParam {String} appId to remove access
     **/
    this.router.delete(
      "/:personId/apps/:appId",
      [
        this.authController.authenticate(["dcd:persons", "dcd:apps"]),
        this.policyController.checkPolicy("delete"),
      ],
      this.controller.deleteAPersonApp.bind(this.controller)
    );

    this.notificationRouter = new NotificationRouter();
    this.router.use(
      "/:personId/notifications",
      this.notificationRouter.getRouter()
    );
  }
}
