import { Request, Response, NextFunction } from "express"
import { DCDError } from "@datacentricdesign/types"
import config from "../../config"
import AuthController from "../../auth/AuthController";

/**
   * Introspect the token from the 'Authorization' HTTP header to
   * determined if it is valid and who it belongs to.
   */
export const introspectToken = (requiredScope: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (requiredScope.length === 0 && req.params.entity !== undefined) {
            requiredScope = [req.params.entity]
        }
        const token = extractToken(req)
        return AuthController.authService.refresh()
            .then(() => {
                console.log('introspect')
                return AuthController.authService
                    .introspect(token, requiredScope)
            })
            .then((user: any) => {
                req.context = {
                    userId: user.sub
                }
                return next()
            })
            .catch((error: DCDError) => next(error))
    }
};


/**
 * Check and extract the token from the header
 * @param req
 * @return {*|void|string}
 */
function extractToken(req: Request): any | void | string {

    console.log(req.headers)
    if (req.get('Authorization') === undefined) {
        throw new DCDError(4031, 'Add \'Authorization\' header.')
    } else if (
        !req.get('Authorization').startsWith('bearer ') &&
        !req.get('Authorization').startsWith('Bearer ')
    ) {
        throw new DCDError(
            4031,
            'Add \'bearer \' in front of your \'Authorization\' token.'
        )
    }
    return req
        .get('Authorization')
        .replace(/bearer\s/gi, '')
        .replace(/Bearer\s/gi, '')
}