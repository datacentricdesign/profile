import { Router } from "express";

import { introspectToken } from "./middlewares/introspectToken";
import { checkPolicy } from "./middlewares/checkPolicy";

import GroupController from "./GroupController";

export const GroupRouter = Router();




/**
 * @api {get} /groups List
 * @apiGroup Group
 * @apiDescription List groups in which I am in as well as groups I manage
 * @apiVersion 0.1.2
**/
GroupRouter.get(
    "/",
    [introspectToken(['dcd:persons'])],
    GroupController.listGroups
);

/**
 * @api {post} /groups Create
 * @apiGroup Group
 * @apiDescription Create a group
 * @apiVersion 0.1.2
 * 
 * @apiParam (Body) {string} id Id of the group to create.
 * @apiParam (Body) {string[]} members Array of Ids of members to add to the group.
**/
GroupRouter.post(
    "/",
    [introspectToken(['dcd:groups'])],
    GroupController.createAGroup
);

/**
 * @api {delete} /groups Delete
 * @apiGroup Group
 * @apiDescription Create a group
 * @apiVersion 0.1.2
**/
GroupRouter.delete(
    "/:groupId",
    [introspectToken(['dcd:groups']), checkPolicy('groups','delete')],
    GroupController.deleteAGroup
);

/**
 * @api {get} /groups/:groupId/check Check
 * @apiGroup Group
 * @apiDescription Check if a group id exist
 * @apiVersion 0.1.2
**/
GroupRouter.get(
    "/:groupId/check",
    [introspectToken(['dcd:groups'])],
    GroupController.checkIfGroupIdExists
);

/**
 * @api {post} /groups/:groupId/members Add
 * @apiGroup Group
 * @apiDescription Add persons to a group
 * @apiVersion 0.1.2
**/
GroupRouter.post(
    "/:groupId/members",
    [introspectToken(['dcd:groups']), checkPolicy('groups','update')],
    GroupController.addMembersToAGroup
);

/**
 * @api {delete} /groups/:groupId/members Remove
 * @apiGroup Group
 * @apiDescription Remove persons from a group
 * @apiVersion 0.1.2
**/
GroupRouter.delete(
    "/:groupId/members/:memberId",
    [introspectToken(['dcd:groups']), checkPolicy('groups','update')],
    GroupController.removeMembersFromAGroup
);

/**
 * @api {get} /groups/:groupId/members List Members
 * @apiGroup Group
 * @apiDescription List person in a group
 * @apiVersion 0.1.2
**/
GroupRouter.get(
    "/:groupId/members",
    [introspectToken(['dcd:groups']), checkPolicy('groups','read')],
    GroupController.listMembersOfAGroup
);