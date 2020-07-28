import fetch from "node-fetch"
import config from "../config";


/**
 * Helper that takes type (can be "login" or "consent")
 * and a challenge and returns the response from ORY Hydra.
 * @param flow
 * @param challenge
 * @return {*}
 */
function get(flow, challenge) {
  const url = config.oauth2.hydraURL + "/oauth2/auth/requests/" + flow + "?challenge=" + challenge
  console.log(url)
  return fetch(url,
    {
      headers: {
        "X-Forwarded-Proto": "https"
      }
    }
  ).then(function(res) {
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network related
      // (network related errors are handled automatically)
      return res.json().then(function(body) {
        console.error("An error occurred while making a HTTP request: ", body);
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
function put(flow, action, challenge, body) {
  return fetch(
    // Joins process.env.HYDRA_URL with the request path
    config.oauth2.hydraURL + "/oauth2/auth/requests/" + flow + "/" + action + "?challenge=" + challenge,
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-Proto": "https"
      }
    }
  ).then(function(res) {
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network
      // related (network related errors are handled automatically)
      return res.json().then(function(body) {
        console.error("An error occurred while making a HTTP request: ", body);
        return Promise.reject(new Error(body.error.message));
      });
    }

    return res.json();
  });
}

export const hydra = {
  // Fetches information on a login request.
  getLoginRequest: function(challenge) {
    return get("login", challenge);
  },
  // Accepts a login request.
  acceptLoginRequest: function(challenge, body) {
    return put("login", "accept", challenge, body);
  },
  // Rejects a login request.
  rejectLoginRequest: function(challenge) {
    return put("login", "reject", challenge, {});
  },
  // Fetches information on a consent request.
  getConsentRequest: function(challenge) {
    return get("consent", challenge);
  },
  // Accepts a consent request.
  acceptConsentRequest: function(challenge, body) {
    return put("consent", "accept", challenge, body);
  },
  // Rejects a consent request.
  rejectConsentRequest: function(challenge, body) {
    return put("consent", "reject", challenge, body);
  },
  // Fetches information on a logout request.
  getLogoutRequest: function(challenge) {
    return get("logout", challenge);
  },
  // Accepts a logout request.
  acceptLogoutRequest: function(challenge) {
    return put("logout", "accept", challenge, {});
  },
  // Reject a logout request.
  rejectLogoutRequest: function(challenge) {
    return put("logout", "reject", challenge, {});
  }
};
