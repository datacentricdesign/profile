import fetch from "node-fetch";
import config from "../config";
import { Log } from "../Logger";

/**
 * Helper that takes type (can be "login" or "consent")
 * and a challenge and returns the response from ORY Hydra.
 * @param flow
 * @param challenge
 * @return {*}
 */
function get(flow, challenge) {
  const url =
    config.oauth2.oAuth2HydraAdminURL +
    "/oauth2/auth/requests/" +
    flow +
    "?challenge=" +
    challenge;
  return fetch(url, {
    headers: {
      "X-Forwarded-Proto": "https",
    },
  }).then(function (res) {
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network related
      // (network related errors are handled automatically)
      return res.json().then(function (body) {
        Log.error("An error occurred while making a HTTP request: ", body);
        return Promise.reject(new Error(body.error.message));
      });
    }

    return res.json();
  });
}

//
/**
 * Helper that takes type (can be "login" or "consent"),
 * the action (can be "accept" or "reject") and a challenge
 * and returns the response from ORY Hydra.
 * @param flow
 * @param action
 * @param challenge
 * @param body
 * @return {*}
 */
function put(flow: string, action: string, challenge: string, body) {
  return fetch(
    config.oauth2.oAuth2HydraAdminURL +
      "/oauth2/auth/requests/" +
      flow +
      "/" +
      action +
      "?challenge=" +
      challenge,
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-Proto": "https",
      },
    }
  ).then(function (res) {
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network
      // related (network related errors are handled automatically)
      return res.json().then(function (body) {
        Log.error("An error occurred while making a HTTP request: ", body);
        return Promise.reject(new Error(body.error.message));
      });
    }

    return res.json();
  });
}

export const hydra = {
  // Fetches information on a login request.
  getLoginRequest: function (challenge: string) {
    return get("login", challenge);
  },
  // Accepts a login request.
  acceptLoginRequest: function (challenge: string, body) {
    return put("login", "accept", challenge, body);
  },
  // Rejects a login request.
  rejectLoginRequest: function (challenge: string) {
    return put("login", "reject", challenge, {});
  },
  // Fetches information on a consent request.
  getConsentRequest: function (challenge: string) {
    return get("consent", challenge);
  },
  // Accepts a consent request.
  acceptConsentRequest: function (challenge: string, body) {
    return put("consent", "accept", challenge, body);
  },
  // Rejects a consent request.
  rejectConsentRequest: function (challenge: string, body) {
    return put("consent", "reject", challenge, body);
  },
  // Fetches information on a logout request.
  getLogoutRequest: function (challenge: string) {
    return get("logout", challenge);
  },
  // Accepts a logout request.
  acceptLogoutRequest: function (challenge: string) {
    return put("logout", "accept", challenge, {});
  },
  // Reject a logout request.
  rejectLogoutRequest: function (challenge: string) {
    return put("logout", "reject", challenge, {});
  },
};
