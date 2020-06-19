
import { getRepository, DeleteResult} from "typeorm";

import { Person } from "./Person";
import { PolicyService } from "./PolicyService";

import { v4 as uuidv4 } from 'uuid';
import { envConfig } from "../config/envConfig";
import { DCDError } from "../types/DCDError";
import { DTOPerson } from "../types";

const PG_UNIQUE_CONSTRAINT_VIOLATION = "23505";

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
            return Promise.reject(new DCDError(4003, 'Add field type.'))
        }
        const personId = "dcd:persons:" + uuidv4()
        const person: Person = new Person()
        person.id = personId,
        person.email = dtoPerson.email,
        person.name = dtoPerson.name,
        person.password = dtoPerson.password

        // Try to retrieve Thing from the database
        try {
            const personRepository = getRepository(Person);
            await personRepository.save(person);
            if (envConfig.env === 'production') {
                await PersonService.policyService.grant(personId, personId, 'subject');
            }
            return person;
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

    /**
     * Read a Person.
     * @param {string} personId
     * returns {string} The person id if valid, else undefined
     **/
    async checkPersonByEmailPassword(personEmail: string, personPassword: string) {
        const personRepository = getRepository(Person);
        let person = await personRepository
                                .createQueryBuilder("person")
                                .where("person.email = :personEmail AND person.password = :personPassword")
                                .setParameters({ personEmail, personPassword })
                                .getOne()
        return person !== undefined ? person.id : undefined
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
        return personRepository.delete(personId);
    }
}
