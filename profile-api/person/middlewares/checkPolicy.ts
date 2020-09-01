import { Request, Response, NextFunction } from "express";
import { DCDError } from "@datacentricdesign/types";
import { envConfig } from "../../config/envConfig";
import AuthController from "../../auth/AuthController";

/**
 * Check Access Control Policy with Keto, based on subject
 * @param resource
 * @param action
 */
export const checkPolicy = (resource: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const acpResource = buildACPResource(resource, req)
        const acp = {
            resource: acpResource,
            action: 'dcd:actions:' + action,
            subject: req.context.userId
        }
        console.log(acp)
        AuthController.policyService
            .check(acp)
            .then(() => next())
            .catch((error: DCDError) => next(error))
    }
};

/**
 * Build ACP resource from request path
 * @param resource
 * @param req
 * @return {string}
 */
function buildACPResource(resource: string, req: Request): string {
    let acpResource = 'dcd:' + resource
    if (req.params.personId !== undefined) {
        acpResource = req.params.personId
    }
    if (req.params.groupId !== undefined) {
        acpResource = req.params.groupId
    }
    return acpResource
}

