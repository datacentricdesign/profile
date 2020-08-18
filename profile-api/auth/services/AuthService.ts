import fetch from 'node-fetch'
import { RequestInit } from 'node-fetch'
import * as qs from 'querystring'
import * as SimpleOauth from 'simple-oauth2'
import { DCDError } from '@datacentricdesign/types'
import { PolicyService } from './PolicyService'
import config from '../../config'
import { URL } from 'url'
import * as fs from "fs";

export interface Token {
    aud: string,
    exp: Number
}

/**
 * This class handle Authentication and Authorisation processes
 */
export class AuthService {

    scopeLib = JSON.parse(fs.readFileSync("scopes.json", "utf8"));

    oauth2: SimpleOauth.ClientCredentials
    token = null
    jwtTokenMap = []
    private static policyService = new PolicyService()

    constructor() {
        const header = {
            Accept: 'application/json'
        }
        if (config.http.secured) {
            header['X-Forwarded-Proto'] = 'https'
        }
        const params: SimpleOauth.ModuleOptions = {
            client: {
                id: config.oauth2.oAuth2ClientId,
                secret: config.oauth2.oAuth2ClientSecret
            },
            auth: {
                tokenHost: new URL(config.oauth2.oAuth2TokenURL).origin,
                tokenPath: new URL(config.oauth2.oAuth2TokenURL).pathname,
                revokePath: new URL(config.oauth2.oAuth2RevokeURL).pathname
            },
            http: {
                headers: header
            },
            options: {
                bodyFormat: 'form'
            }
        }
        this.oauth2 = new SimpleOauth.ClientCredentials(params)
    }

    /**
     * @param {string} token
     * @param {Array<string>} requiredScope
     * @return {Promise<any>}
     */
    introspect(token: Token, requiredScope: string[] = []) {
        const body = { token: token }
        // const body = { token: token, scope: requiredScope.join(" ") };
        const url = config.oauth2.oAuth2IntrospectURL

        console.log(url)

        return this.authorisedRequest(
            'POST',
            url,
            body,
            'application/x-www-form-urlencoded'
        )
            .then(body => {
                if (!body.active) {
                    return Promise.reject(
                        new DCDError(4031, 'The bearer token is not active')
                    )
                }
                if (body.token_type && body.token_type !== 'access_token') {
                    return Promise.reject(
                        new DCDError(4031, 'The bearer token is not an access token')
                    )
                }
                return Promise.resolve(body)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    }

    refresh() {
        if (this.token) {
            if (this.token.expired()) {
                return this.requestNewToken()
            }
            return Promise.resolve()
        }
        return this.requestNewToken()
    }

    requestNewToken() {
        console.debug("request new token")
        return this.oauth2.getToken({ scope: config.oauth2.oAuth2Scope })
            .then(result => {
                console.debug("create token")
                this.token = this.oauth2.createToken(result)
                return Promise.resolve()
            })
            .catch(error => {
                console.debug(error)
                return Promise.reject(error)
            })
    }

    getBearer() {
        return 'bearer ' + qs.escape(this.token.token.access_token)
    }

    /**
     * Build HTTP request with token and return the result
     * @param {String} method
     * @param {String} url
     * @param {Object} body (optional)
     * @param {String} type (default: application/json)
     * @returns {Promise}
     */
    async authorisedRequest(method: string, url: string, body: object = null, type: string = 'application/json'): Promise<any> {
        const options: RequestInit = {
            headers: {
                Authorization: this.getBearer(),
                'Content-Type': type,
                Accept: 'application/json'
            },
            method: method,
            timeout: 15000
        }
        if (config.http.secured) {
            options.headers['X-Forwarded-Proto'] = 'https'
        }
        if (body !== null) {
            let bodyStr = ''
            if (type === 'application/x-www-form-urlencoded') {
                bodyStr = qs.stringify(body as qs.ParsedUrlQueryInput)
            } else {
                bodyStr = JSON.stringify(body)
            }
            options.headers['Content-Length'] = bodyStr.length
            options.body = bodyStr
        }
        try {
            const res = await fetch(url, options)
            if (res.ok) {
                return res.json()
            }
            return Promise.reject(new DCDError(res.status, res.statusText))
        }
        catch (error) {
            return Promise.reject(error)
        }
    }


    /**
     * List a Person's apps.
     * @param {string} personId
     * returns {Person}
     **/
    async listAPersonApps(personId: string) {
        console.log('list a person\'s apps')
        const url = config.oauth2.oAuth2HydraAdminURL + "/oauth2/auth/sessions/consent?subject=" + personId
        console.log(url)
        const res = await fetch(url, { headers: { "X-Forwarded-Proto": "https" } })
        if (res.status < 200 || res.status > 302) {
            // This will handle any errors that aren't network related
            // (network related errors are handled automatically)
            const error = await res.json()
            console.error("An error occurred while making a HTTP request: ", error)
            return Promise.reject(new Error(error.error.message))
        }
        const result = await res.json()
        for (let i = 0; i < result.length; i++) {
            result[i].consent_request.requested_scope = this.buildDetailedScopes(result[i].consent_request.requested_scope)
        }
        return Promise.resolve(result)
    }

    /**
     * Delete a Person's app.
     * @param {string} personId
     * returns {Person}
     **/
    async deleteAPersonApp(personId: string, clientId: string) {
        console.log('Delete a person\'s app')
        const url = config.oauth2.oAuth2HydraAdminURL + "/oauth2/auth/sessions/consent?subject=" + personId + '&client=' + clientId
        console.log(url)
        const res = await fetch(url, { headers: { "X-Forwarded-Proto": "https" }, method: 'DELETE'})
        if (res.status < 200 || res.status > 302) {
            // This will handle any errors that aren't network related
            // (network related errors are handled automatically)
            const error = await res.json()
            console.error("An error occurred while making a HTTP request: ", error)
            return new Error(error.error.message)
        }
    }

    buildDetailedScopes(scopes) {
        const detailedScopes = [];
        for (let key in scopes) {
            if (this.scopeLib[scopes[key]]) {
                detailedScopes.push(this.scopeLib[scopes[key]]);
            } else {
                detailedScopes.push({
                    id: scopes[key],
                    name: scopes[key],
                    desc: ""
                });
            }
        }
        return detailedScopes;
    }
}
