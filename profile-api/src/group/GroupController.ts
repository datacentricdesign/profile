import { Request, Response, NextFunction } from "express";

import { DCDError } from "@datacentricdesign/types";
import { PolicyService } from "../policy/PolicyService";
import { DCDRequest } from "../config";
import { Group } from "./Group";

export class GroupController {
  private static instance: GroupController;

  public static getInstance(): GroupController {
    if (GroupController.instance === undefined) {
      GroupController.instance = new GroupController();
    }
    return GroupController.instance;
  }

  private policyService: PolicyService;

  private constructor() {
    this.policyService = PolicyService.getInstance();
  }

  async listGroups(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result: any = await this.policyService.listRolesOfAMember(
        req.context.userId
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createAGroup(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id, members } = req.body;
    const group: Group = {
      id: id,
      members: members,
    };
    if (group.id === undefined || !group.id.startsWith("dcd:groups")) {
      return next(
        new DCDError(
          400,
          "An group id should be provided with the prefix dcd:groups"
        )
      );
    }
    try {
      const result: any = await this.policyService.readRole(group.id);
      return next(
        new DCDError(4006, "The group " + group.id + " already exists.")
      );
    } catch (error) {
      if (error.errorCode === 404) {
        // The group does not exists, let's create it
        try {
          await this.policyService.createARole(
            req.context.userId,
            group.id,
            group.members
          );
          res.status(201).send();
          return;
        } catch (error) {
          return next(error);
        }
      }
      next(error);
    }
  }

  async deleteAGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const groupId: string = req.params.groupId;
    try {
      const result: any = await this.policyService.deleteARole(groupId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async checkIfGroupIdExists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const groupId: string = req.params.groupId;
    try {
      const result: any = await this.policyService.readRole(groupId);
      res.send({ exists: true });
    } catch (error) {
      if (error.errorCode === 404) {
        res.status(404).send({ exists: false });
      } else {
        next(error);
      }
    }
  }

  async addMembersToAGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const groupId: string = req.params.groupId;
    const members: string[] = req.body.members;
    try {
      const result: any = await this.policyService.addMembersToRole(
        groupId,
        members
      );
      if (result.ok) {
        res.status(204).send();
      } else {
        next(new DCDError(500, `Failed to add group members to ${groupId}.`));
      }
    } catch (error) {
      next(error);
    }
  }

  async removeMembersFromAGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const groupId: string = req.params.groupId;
    const memberId: string = req.params.memberId;
    try {
      const result: any = await this.policyService.removeAMemberFromRole(
        groupId,
        memberId
      );
      const json = await result.json();
      if (result.ok) {
        res.status(204).send();
      } else {
        next(new DCDError(500, `Failed to remove members from ${groupId}.`));
      }
      next(new DCDError(404, "Not found"));
    } catch (error) {
      next(error);
    }
  }

  async listMembersOfAGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const groupId: string = req.params.groupId;
    try {
      const result: any = await this.policyService.readRole(groupId);
      res.send(result.json());
    } catch (error) {
      next(error);
    }
  }
}
