import { Response, NextFunction } from "express";

import { PolicyService } from "../../policy/PolicyService";
import { DCDRequest } from "../../config";
import { Notification } from "./Notification";
import { MailService } from "./MailService";
import { DCDError } from "@datacentricdesign/types";

export class NotificationController {
  private static instance: NotificationController;

  public static getInstance(): NotificationController {
    if (NotificationController.instance === undefined) {
      NotificationController.instance = new NotificationController();
    }
    return NotificationController.instance;
  }

  private policyService: PolicyService;
  private mailService: MailService;

  private constructor() {
    this.policyService = PolicyService.getInstance();
    this.mailService = MailService.getInstance();
  }

  async postANotification(
    req: DCDRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { sender, receiver, channel, title, message } = req.body;

    const notification: Notification = {
      sender: sender,
      receiver: receiver,
      channel: channel,
      title: title,
      message: message,
    };

    if (channel === "mail") {
      this.mailService.sendMail(sender, receiver, title, message);
    } else {
      next(
        new DCDError(
          500,
          `Unavailable channel ${notification.channel}. Available options: mail.`
        )
      );
    }
  }
}
