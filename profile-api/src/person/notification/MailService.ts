import * as nodemailer from "nodemailer";
import SMTPConnection = require("nodemailer/lib/smtp-connection");
import SMTPTransport = require("nodemailer/lib/smtp-transport");
import config from "../../config";
import { Log } from "../../Logger";

export class MailService {
  private static instance: MailService;

  public static getInstance(): MailService {
    if (MailService.instance === undefined) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  private constructor() {
    const options: SMTPConnection.Options = {
      host: config.mail.host,
      port: config.mail.port,
    };
    this.transporter = nodemailer.createTransport(options);
  }

  async sendMail(
    from: string,
    to: string,
    subject: string,
    text: string
  ): Promise<void> {
    // send mail with defined transport object
    const info = await this.transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: `<b>${text}</b>`,
    });
    Log.debug("Message sent: %s", info.messageId);
  }
}
