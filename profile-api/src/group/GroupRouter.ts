import { Router } from "express";
import { AuthController } from "../auth/AuthController";
import { PolicyController } from "../policy/PolicyController";

import { GroupController } from "./GroupController";

export class GroupRouter {
  private router: Router;

  private controller: GroupController;
  private policyController: PolicyController;
  private authController: AuthController;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.controller = GroupController.getInstance();
    this.setRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  getController(): GroupController {
    return this.controller;
  }

  setRoutes(): void {
    /**
     * @api {get} /groups List
     * @apiGroup Group
     * @apiDescription List groups in which I am in as well as groups I manage
     * @apiVersion 0.1.2
     **/
    this.router.get(
      "/",
      [this.authController.authenticate(["dcd:persons"])],
      this.controller.listGroups.bind(this.controller)
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
    this.router.post(
      "/",
      [this.authController.authenticate(["dcd:groups"])],
      this.controller.createAGroup.bind(this.controller)
    );

    /**
     * @api {delete} /groups Delete
     * @apiGroup Group
     * @apiDescription Create a group
     * @apiVersion 0.1.2
     **/
    this.router.delete(
      "/:groupId",
      [
        this.authController.authenticate(["dcd:groups"]),
        this.policyController.checkPolicy("delete"),
      ],
      this.controller.deleteAGroup.bind(this.controller)
    );

    /**
     * @api {get} /groups/:groupId/check Check
     * @apiGroup Group
     * @apiDescription Check if a group id exist
     * @apiVersion 0.1.2
     **/
    this.router.get(
      "/:groupId/check",
      [this.authController.authenticate(["dcd:groups"])],
      this.controller.checkIfGroupIdExists.bind(this.controller)
    );

    /**
     * @api {post} /groups/:groupId/members Add
     * @apiGroup Group
     * @apiDescription Add persons to a group
     * @apiVersion 0.1.2
     **/
    this.router.post(
      "/:groupId/members",
      [
        this.authController.authenticate(["dcd:groups"]),
        this.policyController.checkPolicy("update"),
      ],
      this.controller.addMembersToAGroup.bind(this.controller)
    );

    /**
     * @api {delete} /groups/:groupId/members Remove
     * @apiGroup Group
     * @apiDescription Remove persons from a group
     * @apiVersion 0.1.2
     **/
    this.router.delete(
      "/:groupId/members/:memberId",
      [
        this.authController.authenticate(["dcd:groups"]),
        this.policyController.checkPolicy("update"),
      ],
      this.controller.removeMembersFromAGroup.bind(this.controller)
    );

    /**
     * @api {get} /groups/:groupId/members List Members
     * @apiGroup Group
     * @apiDescription List person in a group
     * @apiVersion 0.1.2
     **/
    this.router.get(
      "/:groupId/members",
      [
        this.authController.authenticate(["dcd:groups"]),
        this.policyController.checkPolicy("read"),
      ],
      this.controller.listMembersOfAGroup.bind(this.controller)
    );
  }
}
