
import { getRepository, DeleteResult} from "typeorm";

import { Person } from "./Person";
import { PolicyService } from "../auth/services/PolicyService";

import { v4 as uuidv4 } from 'uuid';
import { envConfig } from "../config/envConfig";
import { DCDError, DTOPerson } from "@datacentricdesign/types";

const PG_UNIQUE_CONSTRAINT_VIOLATION = "23505";

import * as crypto from 'crypto'
import config from "../config";
import fetch from "node-fetch";

export class PersonService {

    private static policyService = new PolicyService()

    /**
     *
     * @constructor
     */
    constructor() {
    }

    /**
     * Create a new Person.
     *
     * @param {Person} person
     * returns Person
     **/
    async createNewPerson(dtoPerson: DTOPerson): Promise<Person> {
        // Check Thing input
        if (dtoPerson.name === undefined || dtoPerson.name === '') {
            return Promise.reject(new DCDError(4003, 'Add field name.'))
        }
        if (dtoPerson.email === undefined || dtoPerson.email === '') {
            return Promise.reject(new DCDError(4003, 'Add field email.'))
        }
        if (dtoPerson.id === undefined || !dtoPerson.id.startsWith('dcd:persons')) {
            return Promise.reject(new DCDError(4003, 'An id should be provided with the prefix dcd:persons'))
        }
        const exists = await this.checkIfPersonIdExists(dtoPerson.id)
        if (exists) {
            return Promise.reject(new DCDError(4003, 'This id (username) is already in use'))
        }
        
        const person: Person = new Person()
        person.id = dtoPerson.id
        person.email = dtoPerson.email
        person.name = dtoPerson.name
        PersonService.validPassword(dtoPerson.password)
        person.password = PersonService.encryptPassword(dtoPerson.password)

        // Try to retrieve Thing from the database
        try {
            const personRepository = getRepository(Person);
            await personRepository.save(person);
            await PersonService.policyService.grant(person.id, person.id, 'person');
            await PersonService.policyService.addMembersToRole("dcd:groups:public", [person.id]);
            await PersonService.policyService.addMembersToRole("dcd:groups:user", [person.id]);
            return this.getOnePersonById(person.id);
        } catch(error) {
            if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new DCDError(4002, '')
            }
            throw error
        }
    }

    /**
     * Read a Person.
     * @param {string} personId
     * returns {Person}
     **/
    async getOnePersonById(personId: string) {
        const personRepository = getRepository(Person);
        let person = await personRepository
                                .createQueryBuilder("person")
                                .where("person.id = :personId")
                                .setParameters({ personId: personId })
                                .getOne();

        return person
    }

    async checkPerson(personEmailOrId: string, personPassword: string) {
        if (personEmailOrId.includes('@')) {
            return this.checkPersonByEmailPassword(personEmailOrId, personPassword)
        }
        return this.checkPersonByIdPassword(personEmailOrId, personPassword)
    }

    /**
     * Check if the combination email/password exists.
     * @param {string} personEmail
     * @param {string} personPassword
     * returns {string} The person id if the combination exists, else undefined
     **/
    async checkPersonByEmailPassword(personEmail: string, personPassword: string) {
        const personRepository = getRepository(Person);
        let person = await personRepository
                                .createQueryBuilder("person")
                                .where("person.email = :personEmail AND person.password = :personPassword")
                                .setParameters({ personEmail, personPassword: PersonService.encryptPassword(personPassword) })
                                .getOne()
        return person !== undefined ? person.id : undefined
    }

    /**
     * Check if the combination id/password exists.
     * @param {string} personId
     * @param {string} personPassword
     * returns {string} The person id if the combination exists, else undefined
     **/
    async checkPersonByIdPassword(personId: string, personPassword: string) {
        const personRepository = getRepository(Person);
        let person = await personRepository
                                .createQueryBuilder("person")
                                .where("person.id = :personId AND person.password = :personPassword")
                                .setParameters({ personId, personPassword: PersonService.encryptPassword(personPassword) })
                                .getOne()
        return person !== undefined ? person.id : undefined
    }

    /**
     * Check if a person id is already in use a Person.
     * @param {string} personId
     * returns {string} True if the id is already in use, else false
     **/
    async checkIfPersonIdExists(personId: string) {
        const personRepository = getRepository(Person);
        let person = await personRepository
                                .createQueryBuilder("person")
                                .where("person.id = :personId")
                                .setParameters({ personId })
                                .getOne()
        return person !== undefined
    }

    /**
     * Edit one Person
     * @param personId
     * returns Promise
     **/
    editOnePerson(person: Person) {
        const personRepository = getRepository(Person);
        return personRepository.save(person);
    }

    /**
     * Delete one Person
     * @param personId
     * @return {Promise}
     */
    async deleteOnePerson(personId: string): Promise<DeleteResult> {
        const personRepository = getRepository(Person);
        let person: Person;
        try {
            person = await personRepository.findOneOrFail(personId);
        } catch (error) {
            throw new DCDError( 404, 'Person to delete ' + personId + ' could not be not found.')
        }
        return personRepository.delete(personId).then( () => {
            return PersonService.policyService.revoke(personId, personId, 'person');
        });
    }

    /**
   * @param password plain text password
   * @returns {string} encrypted password
   */
  static encryptPassword(password:string) {
    return crypto
      .createHmac(config.env.cryptoAlgo, config.env.cryptoKey)
      .update(password)
      .digest('hex')
  }

    /**
     * @param {String} password
     */
    static validPassword(password:string) {
    if (typeof password !== 'string') {
      throw new DCDError(4001, 'The field \'password\' must be a string.')
    }
    if (password.length < 8) {
      throw new DCDError(
        4001,
        'Password is too short. Provide a password with 8 characters or more.'
      )
    }
  }
}
