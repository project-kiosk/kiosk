import Mail from "nodemailer/lib/mailer";

export interface MailAdapter
{
  sendMail( platform: Readonly<App.Platform> | undefined, mail: Mail.Options ): Promise<void>;
}
