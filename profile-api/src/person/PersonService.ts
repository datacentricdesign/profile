import { getRepository } from "typeorm";

import { Person } from "./Person";
import { DCDError, DTOPerson } from "@datacentricdesign/types";

import { AuthService } from "../auth/AuthService";
import { PolicyService } from "../policy/PolicyService";

const PG_UNIQUE_CONSTRAINT_VIOLATION = "23505";

import * as crypto from "crypto";
import config from "../config";

export class PersonService {
  private static instance: PersonService;

  public static getInstance(): PersonService {
    if (PersonService.instance === undefined) {
      PersonService.instance = new PersonService();
    }
    return PersonService.instance;
  }

  private policyService: PolicyService;
  private authService: AuthService;

  private constructor() {
    this.policyService = PolicyService.getInstance();
    this.authService = AuthService.getInstance();
  }

  /**
   * Create a new Person.
   *
   * @param {Person} person
   * returns Person
   **/
  async createNewPerson(dtoPerson: DTOPerson): Promise<Person> {
    // Check Thing input
    if (dtoPerson.name === undefined || dtoPerson.name === "") {
      return Promise.reject(new DCDError(400, "Add field name."));
    }
    if (dtoPerson.email === undefined || dtoPerson.email === "") {
      return Promise.reject(new DCDError(400, "Add field email."));
    }
    if (dtoPerson.id === undefined || !dtoPerson.id.startsWith("dcd:persons")) {
      return Promise.reject(
        new DCDError(
          400,
          "An id should be provided with the prefix dcd:persons"
        )
      );
    }
    const exists = await this.checkIfPersonIdExists(dtoPerson.id);
    if (exists) {
      return Promise.reject(
        new DCDError(400, "This id (username) is already in use.")
      );
    }
    const emailExists = await this.checkIfEmailExists(dtoPerson.email);
    if (emailExists) {
      return Promise.reject(
        new DCDError(400, "This email address is already in use.")
      );
    }

    const person: Person = new Person();
    person.id = dtoPerson.id;
    person.email = dtoPerson.email;
    person.name = dtoPerson.name;
    PersonService.validPassword(dtoPerson.password);
    person.password = PersonService.encryptPassword(dtoPerson.password);

    // Try to retrieve Thing from the database
    try {
      const personRepository = getRepository(Person);
      await personRepository.save(person);
      await this.policyService.grant(person.id, person.id, "person");
      await this.policyService.addMembersToRole("dcd:groups:public", [
        person.id,
      ]);
      await this.policyService.addMembersToRole("dcd:groups:user", [person.id]);
      return this.getOnePersonById(person.id);
    } catch (error) {
      if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new DCDError(4002, "");
      }
      throw error;
    }
  }

  /**
   * Read a Person.
   * @param {string} personId
   * returns {Person}
   **/
  async getOnePersonById(personId: string): Promise<Person> {
    const personRepository = getRepository(Person);
    const person = await personRepository
      .createQueryBuilder("person")
      .where("person.id = :personId")
      .setParameters({ personId: personId })
      .getOne();

    return person;
  }

  async checkPerson(
    personEmailOrId: string,
    personPassword: string
  ): Promise<string> {
    if (personEmailOrId.includes("@")) {
      return this.checkPersonByEmailPassword(personEmailOrId, personPassword);
    }
    return this.checkPersonByIdPassword(personEmailOrId, personPassword);
  }

  /**
   * Check if the combination email/password exists.
   * @param {string} personEmail
   * @param {string} personPassword
   * returns {string} The person id if the combination exists, else undefined
   **/
  async checkPersonByEmailPassword(
    personEmail: string,
    personPassword: string
  ): Promise<string> {
    const personRepository = getRepository(Person);
    const person = await personRepository
      .createQueryBuilder("person")
      .where(
        "person.email = :personEmail AND person.password = :personPassword"
      )
      .setParameters({
        personEmail,
        personPassword: PersonService.encryptPassword(personPassword),
      })
      .getOne();
    return person !== undefined ? person.id : undefined;
  }

  /**
   * Check if the combination id/password exists.
   * @param {string} personId
   * @param {string} personPassword
   * returns {string} The person id if the combination exists, else undefined
   **/
  async checkPersonByIdPassword(
    personId: string,
    personPassword: string
  ): Promise<string> {
    const personRepository = getRepository(Person);
    const person = await personRepository
      .createQueryBuilder("person")
      .where("person.id = :personId AND person.password = :personPassword")
      .setParameters({
        personId,
        personPassword: PersonService.encryptPassword(personPassword),
      })
      .getOne();
    return person !== undefined ? person.id : undefined;
  }

  /**
   * Check if a person id is already in use.
   * @param {string} personId
   * returns {string} True if the id is already in use, else false
   **/
  async checkIfPersonIdExists(personId: string): Promise<boolean> {
    const personRepository = getRepository(Person);
    const person = await personRepository
      .createQueryBuilder("person")
      .where("person.id = :personId")
      .setParameters({ personId })
      .getOne();
    return person !== undefined;
  }

  /**
   * Check if a email address is already in use.
   * @param {string} email
   * returns {string} True if the id is already in use, else false
   **/
  async checkIfEmailExists(email: string): Promise<boolean> {
    const personRepository = getRepository(Person);
    const person = await personRepository
      .createQueryBuilder("person")
      .where("person.email = :email")
      .setParameters({ email })
      .getOne();
    return person !== undefined;
  }

  /**
   * Edit one Person
   * @param personId
   * returns Promise
   **/
  editOnePerson(person: Person): Promise<Person> {
    const personRepository = getRepository(Person);
    return personRepository.save(person);
  }

  /**
   * Delete one Person
   * @param personId
   * @return {Promise}
   */
  async deleteOnePerson(personId: string): Promise<void> {
    const personRepository = getRepository(Person);
    try {
      await personRepository.findOneOrFail(personId);
      await this.policyService.deletePolicy(personId, personId, "person");
      await personRepository.delete(personId);
      return Promise.resolve();
    } catch (error) {
      throw new DCDError(
        404,
        `Person to delete ${personId} could not be not found.`
      );
    }
  }

  /**
   * @param password plain text password
   * @returns {string} encrypted password
   */
  static encryptPassword(password: string): string {
    return crypto
      .createHmac(config.env.cryptoAlgo, config.env.cryptoKey)
      .update(password)
      .digest("hex");
  }

  /**
   * @param {String} password
   */
  static validPassword(password: string): void {
    if (typeof password !== "string") {
      throw new DCDError(4001, "The field 'password' must be a string.");
    }
    if (password.length < 8) {
      throw new DCDError(
        4001,
        "Password is too short. Provide a password with 8 characters or more."
      );
    }
  }
}
