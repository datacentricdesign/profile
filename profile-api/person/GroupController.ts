import {Request, Response, Router, NextFunction} from "express";
import {validate} from "class-validator";

import {Person} from "./Person";
import { DTOPerson, DCDError } from "@datacentricdesign/types";
import {PersonService} from "./PersonService"
import AuthController from "../auth/AuthController";
import { PolicyService } from "../auth/services/PolicyService";

export class GroupController {
    static policyService = new PolicyService();

    static listGroups = async (req: Request, res: Response) => {
        try {
            const result: any = await GroupController.policyService.listRolesOfAMember(req.context.userId)
            res.send(result);
        } catch (error) {
            req.next(error);
        }
    };

    static createAGroup = async (req: Request, res: Response, next: NextFunction) => {
        const group = req.body
        if (group.id === undefined || !group.id.startsWith('dcd:groups')) {
            return next(new DCDError(4003, 'An group id should be provided with the prefix dcd:groups'))
        }
        try {
            const result: any = await GroupController.policyService.readRole(group.id)
            return next(new DCDError(4006, 'The group ' + group.id + ' already exists.'))
        } catch (error) {
            if (error.errorCode === 404) {
                // The group does not exists, let's create it
                try {
                    const result: any = await GroupController.policyService.createARole(req.context.userId, group.id, group.members)
                    return res.status(201).send();
                } catch (error) {
                    return req.next(error);
                }
            }
            req.next(error);
        }
    };

    static deleteAGroup = async (req: Request, res: Response) => {
        // Get the ID from the url
        const groupId: string = req.params.groupId;
        try {
            const result: any = await GroupController.policyService.deleteARole(groupId)
            res.status(204).send();
        } catch (error) {
            req.next(error);
        }
    };

    static checkIfGroupIdExists = async (req: Request, res: Response) => {
        const groupId: string = req.params.groupId;
        try {
            const result: any = await GroupController.policyService.readRole(groupId)
            res.send({'exists': true});
        } catch (error) {
            if (error.errorCode === 404) {
                return res.status(404).send({'exists': false});
            }
            req.next(error);
        }
    };

    static addMembersToAGroup = async (req: Request, res: Response) => {
        const groupId: string = req.params.groupId
        const members: string[] = req.body.members
        try {
            const result: any = await GroupController.policyService.addMembersToRole(groupId, members)
            if (result.ok) {
                res.status(204).send();
            }
        } catch (error) {
            req.next(error);
        }
    };

    static removeMembersFromAGroup = async (req: Request, res: Response) => {
        const groupId: string = req.params.groupId
        const memberId: string = req.params.memberId
        try {
            const result: any = await GroupController.policyService.removeAMemberFromRole(groupId, memberId)
            const json = await result.json()
            console.log(result.ok)
            if (result.ok) {
                return res.status(204).send();
            }
            return req.next(new DCDError(404, 'Not found'));
        } catch (error) {
            req.next(error);
        }
    };

    static listMembersOfAGroup = async (req: Request, res: Response) => {
        const groupId: string = req.params.groupId;
        try {
            const result: any = await GroupController.policyService.readRole(groupId)
            res.send(result.json());
        } catch (error) {
            req.next(error);
        }
    };
}

export default GroupController;