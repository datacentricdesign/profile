import { Router } from "express";
import { AuthController } from "../../auth/AuthController";
import { NotificationController } from "./NotificationController";

export class NotificationRouter {
  private router: Router;

  private controller: NotificationController;
  private authController: AuthController;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.controller = NotificationController.getInstance();
    this.authController = AuthController.getInstance();
    this.setRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  getController(): NotificationController {
    return this.controller;
  }

  setRoutes(): void {
    /**
     * @api {post} /notifications Post a notification.
     * @apiGroup Notification
     * @apiDescription Post a Notification
     * @apiVersion 0.1.2
     *
     * @apiParam (Body) {string} sender
     * @apiParam (Body) {string} receiver
     * @apiParam (Body) {string} channel (only 'mail' available for now)
     * @apiParam (Body) {string} title
     * @apiParam (Body) {string} message
     *
     **/
    this.router.post(
      "/",
      [this.authController.authenticate(["dcd:persons:notifications"])],
      this.controller.postANotification.bind(this.controller)
    );
  }
}
