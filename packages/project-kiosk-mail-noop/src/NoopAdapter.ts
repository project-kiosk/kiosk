import { MailAdapter } from "@project-kiosk/types";
import type Mail from "nodemailer/lib/mailer";

export class NoopAdapter implements MailAdapter {
  public sendMail(
    platform: Readonly<App.Platform> | undefined,
    mail: Mail.Options
  ): Promise<void> {
    console.info("No-Op Mail adapter: Would send email", {
      ...mail,
    });

    return Promise.resolve(undefined);
  }
}
