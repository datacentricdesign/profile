import "dotenv/config";

export const mailConfig = {
  host: process.env.MAIL_HOST,
  port: +process.env.MAIL_PORT,
  sender: process.env.MAIL_SENDER,
};
