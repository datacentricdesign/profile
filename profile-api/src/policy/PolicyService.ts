import { getRepository } from "typeorm";
import { httpConfig } from "../config/httpConfig";
import { DCDError } from "@datacentricdesign/types";

import fetch, { Response } from "node-fetch";
import config from "../config";
import { Role } from "../person/role/Role";

import { v4 as uuidv4 } from "uuid";
import { Policy } from "./Policy";

/**
 * Manage access policies
 */
export class PolicyService {
  private static instance: PolicyService;

  public static getInstance(): PolicyService {
    if (PolicyService.instance === undefined) {
      PolicyService.instance = new PolicyService();
    }
    return PolicyService.instance;
  }

  private ketoHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  /**
   *
   */
  private constructor() {
    if (httpConfig.secured) {
      this.ketoHeaders["X-Forwarded-Proto"] = "https";
    }
  }

  /**
   * Grant a role on a resource entity to a subject entity
   * @param {string} subjectId
   * @param {string} resourceId
   * @param {string} roleName
   * returns Promise
   **/
  async grant(subjectId: string, resourceId: string, roleName: string) {
    try {
      const policyId = await this.getRoleId(subjectId, resourceId, roleName);
      // There is an existing policy, let's update
      return this.createPolicy(
        subjectId,
        resourceId,
        roleName,
        "allow",
        policyId
      );
    } catch (error) {
      if (error.errorCode === 4041) {
        // No existing policy (Not found)
        return this.createPolicy(subjectId, resourceId, roleName, "allow");
      }
      return Promise.reject(error); // Otherwise, something went wrong
    }
  }

  /**
   * Revoke a role on a resource entity to a subject entity
   * @param {string} subjectId
   * @param {string} resourceId
   * @param {string} roleName
   * returns Promise
   **/
  async revoke(
    subjectId: string,
    resourceId: string,
    roleName: string
  ): Promise<any> {
    try {
      const policyId: string = await this.getRoleId(
        subjectId,
        resourceId,
        roleName
      );
      // There is an existing policy, let's update
      return this.createPolicy(
        subjectId,
        resourceId,
        roleName,
        "deny",
        policyId
      );
    } catch (error) {
      if (error.errorCode === 4041) {
        // No existing policy (Not found)
        return this.createPolicy(subjectId, resourceId, roleName, "deny");
      }
      return Promise.reject(error); // Otherwise, something went wrong
    }
  }

  async getRoleId(
    subjectId: string,
    resourceId: string,
    roleName: string
  ): Promise<string> {
    const roleRepository = getRepository(Role);
    try {
      const role: Role = await roleRepository.findOneOrFail({
        where: {
          actorEntityId: subjectId,
          subjectEntityId: resourceId,
          role: roleName,
        },
      });
      return role.id;
    } catch (error) {
      throw new DCDError(
        4041,
        "Role not found for " +
          subjectId +
          ", " +
          resourceId +
          " and " +
          roleName
      );
    }
  }

  async listRolesOfAMember(member: string) {
    const url =
      config.oauth2.acpURL.origin +
      "/engines/acp/ory/exact/roles?member=" +
      member;
    try {
      const res = await fetch(url, {
        headers: this.ketoHeaders,
        method: "GET",
      });
      const groups = await res.json();
      for (let i = 0; i < groups.length; i++) {
        try {
          await this.check({
            resource: groups[i].id,
            subject: member,
            action: "dcd:actions:update",
          });
          groups[i].isAdmin = true;
        } catch (error) {
          groups[i].isAdmin = false;
          delete groups[i].members;
        }
      }
      return Promise.resolve(groups);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async createARole(creator: string, roleId: string, members: string[]) {
    const url = config.oauth2.acpURL.origin + "/engines/acp/ory/exact/roles";
    const body = JSON.stringify({ id: roleId, members: members });
    try {
      // create the group as new role with members on Keto
      const res = await fetch(url, {
        headers: this.ketoHeaders,
        method: "PUT",
        body: body,
      });
      // Create a policy giving management rights to the group creator
      const policy = {
        id: roleId,
        effect: "allow",
        actions: roleToActions("groupAdmin"),
        subjects: [creator],
        resources: [roleId],
      };
      return this.updateKetoPolicy(policy);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteARole(roleId: string) {
    const url =
      config.oauth2.acpURL.origin + "/engines/acp/ory/exact/roles/" + roleId;
    try {
      // Delete the role on Keto (and its list of members)
      const res = await fetch(url, {
        headers: this.ketoHeaders,
        method: "DELETE",
      });
      // Delete the policy giving management rights to the group creator
      return this.deleteKetoPolicy(roleId);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async addMembersToRole(roleId: string, members: string[]) {
    const url =
      config.oauth2.acpURL.origin +
      "/engines/acp/ory/exact/roles/" +
      roleId +
      "/members";
    const body = JSON.stringify({ members: members });
    try {
      return fetch(url, { headers: this.ketoHeaders, method: "PUT", body });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async removeAMemberFromRole(roleId: string, memberId: string) {
    const url =
      config.oauth2.acpURL.origin +
      "/engines/acp/ory/exact/roles/" +
      roleId +
      "/members/" +
      memberId;
    try {
      return fetch(url, { headers: this.ketoHeaders, method: "DELETE" });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async readRole(roleId: string) {
    const url =
      config.oauth2.acpURL.origin + "/engines/acp/ory/exact/roles/" + roleId;
    try {
      const res = await fetch(url, {
        headers: this.ketoHeaders,
        method: "GET",
      });
      if (res.status === 404) {
        return Promise.reject(new DCDError(404, "Role not found"));
      }
      Promise.resolve(res.json());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async createPolicy(
    subjectId: string,
    resourceId: string,
    roleName: string,
    effect = "allow",
    id?: string
  ): Promise<Response> {
    const policyId = id !== undefined ? id : uuidv4();
    const roleRepository = getRepository(Role);
    const newRole: Role = {
      id: policyId,
      actorEntityId: subjectId,
      subjectEntityId: resourceId,
      role: roleName,
    };

    try {
      await roleRepository.save(newRole);
    } catch (error) {
      return Promise.reject(error);
    }

    const policy = {
      id: policyId,
      effect: effect,
      actions: roleToActions(roleName),
      subjects: [subjectId],
      resources: [resourceId],
    };
    return this.updateKetoPolicy(policy);
  }

  async deletePolicy(subjectId: string, resourceId: string, roleName: string) {
    try {
      const roleId: string = await this.getRoleId(
        subjectId,
        resourceId,
        roleName
      );
      // There is an existing policy
      const roleRepository = getRepository(Role);
      await roleRepository.delete(roleId);
      // Use the role id to retrieve and delete associated Keto's policy
      return this.deleteKetoPolicy(roleId);
    } catch (error) {
      return Promise.reject(error); // Otherwise, something went wrong
    }
  }

  async check(acp: Policy, flavor = "regex"): Promise<void> {
    const url =
      config.oauth2.acpURL.origin + "/engines/acp/ory/" + flavor + "/allowed";
    const options = {
      headers: this.ketoHeaders,
      method: "POST",
      body: JSON.stringify(acp),
    };
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        return Promise.resolve();
      }
      return Promise.reject(new DCDError(4031, "Request was not allowed"));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async checkGroupMembership(
    member: string,
    groupId: string,
    flavor = "exact"
  ): Promise<void> {
    const url =
      config.oauth2.acpURL.origin +
      "/engines/acp/ory/" +
      flavor +
      "/roles?member=" +
      member;
    try {
      const res = await fetch(url, {
        headers: this.ketoHeaders,
        method: "GET",
      });
      const groups = await res.json();
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].id === groupId) {
          return Promise.resolve();
        }
      }
      return Promise.reject(
        new DCDError(
          4030,
          member + " is not member of the group " + groupId + "."
        )
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   *
   * @param policy
   * @returns {Promise<Response>}
   */
  async updateKetoPolicy(policy: any): Promise<Response> {
    try {
      const result = await fetch(
        config.oauth2.acpURL.href + "engines/acp/ory/regex/policies",
        {
          headers: this.ketoHeaders,
          method: "PUT",
          body: JSON.stringify(policy),
        }
      );
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(new DCDError(403, "Not allowed: " + error.message));
    }
  }

  async deleteKetoPolicy(policyId: string) {
    try {
      const result = await fetch(
        config.oauth2.acpURL.href +
          "engines/acp/ory/regex/policies/" +
          policyId,
        {
          headers: this.ketoHeaders,
          method: "DELETE",
        }
      );
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(new DCDError(403, "Not allowed: " + error.message));
    }
  }
}

const roleToActions = (role: string) => {
  switch (role) {
    case "user":
      return ["dcd:actions:create", "dcd:actions:list"];
    case "reader":
      return ["dcd:actions:read", "dcd:actions:list"];
    case "owner":
      return [
        "dcd:actions:create",
        "dcd:actions:list",
        "dcd:actions:read",
        "dcd:actions:update",
        "dcd:actions:delete",
        "dcd:actions:grant",
        "dcd:actions:revoke",
      ];
    case "subject":
      return ["dcd:actions:create", "dcd:actions:read", "dcd:actions:update"];
    case "person":
      return ["dcd:actions:read", "dcd:actions:update", "dcd:actions:delete"];
    case "groupAdmin":
      return ["dcd:actions:read", "dcd:actions:update", "dcd:actions:delete"];
    default:
      return [];
  }
};
