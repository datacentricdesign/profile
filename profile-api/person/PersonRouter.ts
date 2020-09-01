import { Router } from "express";

import { introspectToken } from "./middlewares/introspectToken";
import { checkPolicy } from "./middlewares/checkPolicy";

import PersonController from "./PersonController";

export const PersonRouter = Router();

/**
 * @api {get} /persons/health
 * @apiGroup Person
 * @apiDescription Get Health status of Persons API
 *
 * @apiVersion 0.1.0
 *
 * @apiSuccess {object} health status
**/
PersonRouter.get(
    "/health",
    PersonController.apiHealth);



/**
 * @api {get} /persons/:personId Read
 * @apiGroup Person
 * @apiDescription Get one Person.
 *
 * @apiVersion 0.1.0
 *
 * @apiHeader {String} Authorization TOKEN ID
 *
 * @apiParam {String} persongId Id of the Person to read.
 *
 * @apiSuccess {object} person The retrieved Person
 **/
PersonRouter.get(
    "/:personId",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'read')],
    PersonController.getOnePersonById
);

/**
 * @api {get} /persons/:personId Check
 * @apiGroup Person
 * @apiDescription Check is a person id already exist.
 *
 * @apiVersion 0.1.0
 *
 * @apiParam {String} persongId Id of the Person to read.
 *
 * @apiSuccess {object} person The retrieved Person
 **/
PersonRouter.get("/:personId/check",
    PersonController.checkIfPersonIdExists
);

/**
     * @api {post} /persons Create
     * @apiGroup Person
     * @apiDescription Create a new Person.
     *
     * @apiVersion 0.1.0
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
PersonRouter.post(
    "/",
    PersonController.createNewPerson);

/**
     * @api {patch} /persons/:personId Update
     * @apiGroup Person
     * @apiDescription Edit one Person.
     *
     * @apiVersion 0.1.0
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} personId Id of the Person to update.
**/
PersonRouter.patch(
    "/:personId",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'update')],
    PersonController.editPerson
);

/**
     * @api {delete} /persons/:personId Delete
     * @apiGroup Person
     * @apiDescription Delete one Person.
     *
     * @apiVersion 0.1.0
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} persongId Id of the Person to delete.
**/
PersonRouter.delete(
    "/:personId",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'delete')],
    PersonController.deleteOnePerson
);

/**
     * @api {get} /persons/:personId/apps List
     * @apiGroup Apps
     * @apiDescription List apps' sessions
     *
     * @apiVersion 0.1.0
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} personId
     * 
     * @apiReturn {String} array of app sessions.
**/
PersonRouter.get(
    "/:personId/apps",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'read')],
    PersonController.listAPersonApps
);

/**
     * @api {get} /persons/:personId/apps/:appId Revoke
     * @apiGroup Apps
     * @apiDescription Revoke app access
     *
     * @apiVersion 0.1.0
     *
     * @apiHeader {String} Authorization TOKEN ID
     *
     * @apiParam {String} personId
     * @apiParam {String} appId to remove access
**/
PersonRouter.delete(
    "/:personId/apps/:appId",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'delete')],
    PersonController.deleteAPersonApp
);


