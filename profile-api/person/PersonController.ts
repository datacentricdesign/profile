import {Request, Response, Router, NextFunction} from "express";
import {validate} from "class-validator";

import {Person} from "./Person";
import { DTOPerson } from "@datacentricdesign/types";
import {PersonService} from "./PersonService"
import AuthController from "../auth/AuthController";

export class PersonController {

    static personService = new PersonService();

    static apiHealth = async (req: Request, res: Response) => {
        res.send({status: "OK"});
    };

    static getOnePersonById = async (req: Request, res: Response) => {
        // Get the ID from the url
        const personId: string = req.params.personId;
        try {
            // Get the Person from the Service
            const person: Person = await PersonController.personService.getOnePersonById(personId)
            res.send(person);
        } catch (error) {
            res.status(404).send("Person not found");
        }
    };

    static listAPersonSessions = async (req: Request, res: Response) => {
        // Get the ID from the url
        const personId: string = req.params.personId;
        try {
            const sessions: any = await AuthController.authService.listAPersonSessions(personId)
            res.send(sessions);
        } catch (error) {
            res.status(404).send("Person's sessions not found");
        }
    };

    static deleteAPersonSession = async (req: Request, res: Response) => {
        // Get the ID from the url
        const personId: string = req.params.personId;
        const clientId: string = req.params.clientId;
        try {
            await AuthController.authService.deleteAPersonSession(personId, clientId)
            res.status(204).send();
        } catch (error) {
            console.log(error)
            res.status(404).send("Person's sessions not found");
        }
    };

    static createNewPerson = async (req: Request, res: Response, next: NextFunction) => {
        // Get parameters from the body
        let {name, password, email} = req.body;
        let person: DTOPerson;
        person = {
            name: name,
            password: password,
            email: email
        }

        // Validade if the parameters are ok
        const errors = await validate(person);
        if (errors.length > 0) {
            return res.status(400).send(errors);
        }

        try {
            const createdPerson = await PersonController.personService.createNewPerson(person)
            // If all ok, send 201 response
            return res.status(201).send(createdPerson);
        } catch (error) {
            return next(error)
        }
    };

    static editPerson = async (req: Request, res: Response) => {
        // Get the ID from the url
        const personId = req.params.personId;
        // Get values from the body
        const {name, email} = req.body;
        let person: Person;
        try {
            person = await PersonController.personService.getOnePersonById(personId)
        } catch (error) {
            // If not found, send a 404 response
            res.status(404).send("Person not found");
            return;
        }

        // Validate the new values on model
        person.name = name;
        person.email = email;
        const errors = await validate(person);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        // Try to save
        try {
            await PersonController.personService.editOnePerson(person)
        } catch (e) {
            res.status(500).send("failed updating person");
            return;
        }
        //After all send a 204 (no content, but accepted) response
        res.status(204).send();
    };

    static deleteOnePerson = async (req: Request, res: Response, next: NextFunction) => {
        // Get the thing ID from the url
        const personId = req.params.personId;
        // Call the Service
        try {
            await PersonController.personService.deleteOnePerson(personId)
            // After all send a 204 (no content, but accepted) response
            res.status(204).send();
        } catch(error) {
            next(error)
        }
    };

    
};

export default PersonController;