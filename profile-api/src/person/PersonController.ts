import { Response, NextFunction } from "express";
import { validate } from "class-validator";

import { Person } from "./Person";
import { DCDError, DTOPerson } from "@datacentricdesign/types";
import { DCDRequest } from "../config";
import { PersonService } from "./PersonService";
import { AuthService } from "../auth/AuthService";

export class PersonController {
  private static instance: PersonController;

  public static getInstance(): PersonController {
    if (PersonController.instance === undefined) {
      PersonController.instance = new PersonController();
    }
    return PersonController.instance;
  }

  private personService: PersonService;
  private authService: AuthService;

  private constructor() {
    this.personService = PersonService.getInstance();
    this.authService = AuthService.getInstance();
  }

  /**
   * Return a status 'OK', a way to check that the API is up and running.
   */
  public async apiHealth(req: DCDRequest, res: Response): Promise<void> {
    res.send({ status: "OK" });
  }

  public async getOnePersonById(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const personId: string = req.params.personId;
    try {
      // Get the Person from the Service
      const person: Person = await this.personService.getOnePersonById(
        personId
      );
      res.send(person);
    } catch (error) {
      return next(new DCDError(404, "Person not found"));
    }
  }

  public async checkIfPersonIdExists(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const personId: string = req.params.personId;
    try {
      // Get the Person from the Service
      const exists: boolean = await this.personService.checkIfPersonIdExists(
        personId
      );
      res.send({ exists: exists });
    } catch (error) {
      next(error);
    }
  }

  public async listAPersonApps(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const personId: string = req.params.personId;
    try {
      const sessions: any = await this.authService.listAPersonApps(personId);
      res.send(sessions);
    } catch (error) {
      next(new DCDError(404, "Person's apps not found"));
    }
  }

  public async deleteAPersonApp(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const personId: string = req.params.personId;
    const clientId: string = req.params.clientId;
    try {
      await this.authService.deleteAPersonApp(personId, clientId);
      res.status(204).send();
    } catch (error) {
      next(new DCDError(404, "Person's apps not found"));
    }
  }

  public async createNewPerson(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get parameters from the body
    const { id, name, password, email } = req.body;
    const person: DTOPerson = {
      id: id,
      name: name,
      password: password,
      email: email,
    };

    // Validade if the parameters are ok
    const errors = await validate(person);
    if (errors.length > 0) {
      res.status(400).send(errors);
    } else {
      try {
        const createdPerson = await this.personService.createNewPerson(person);
        // If all ok, send 201 response
        res.status(201).send(createdPerson);
      } catch (error) {
        next(error);
      }
    }
  }

  public async editPerson(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the ID from the url
    const personId = req.params.personId;
    // Get values from the body
    const { name, email } = req.body;
    let person: Person;
    try {
      person = await this.personService.getOnePersonById(personId);
    } catch (error) {
      // If not found, send a 404 response
      return next(new DCDError(404, "Person not found"));
    }

    // Validate the new values on model
    person.name = name;
    person.email = email;
    const errors = await validate(person);
    if (errors.length > 0) {
      return next(new DCDError(400, JSON.stringify(errors)));
    }

    // Try to save
    try {
      await this.personService.editOnePerson(person);
    } catch (e) {
      return next(new DCDError(500, "failed updating person"));
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  }

  public async deleteOnePerson(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Get the thing ID from the url
    const personId = req.params.personId;
    // Call the Service
    try {
      await this.personService.deleteOnePerson(personId);
      // After all send a 204 (no content, but accepted) response
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
