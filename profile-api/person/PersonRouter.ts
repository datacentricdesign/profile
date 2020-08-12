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
     * @api {post} /persons Create
     * @apiGroup Person
     * @apiDescription Create a new Person.
     *
     * @apiVersion 0.1.0
     *
     * @apiParam (Body) {Person} person Person to create as JSON.
     * @apiParamExample {json} person:
     *     {
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

PersonRouter.get(
    "/:personId/sessions",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'read')],
    PersonController.listAPersonSessions
);

PersonRouter.delete(
    "/:personId/sessions/:clientId",
    [introspectToken(['dcd:persons']), checkPolicy('persons', 'delete')],
    PersonController.deleteAPersonSession
);