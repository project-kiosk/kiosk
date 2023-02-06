import { NodemailerAdapter } from "@project-kiosk/mail-nodemailer";
import { createTransport, Transporter } from "nodemailer";
import { MailjetTransport } from "nodemailer-mailjet-transport";

export class MailjetAdapter extends NodemailerAdapter {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  public constructor(apiKey: string, apiSecret: string) {
    super();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  public setupTransport(): Transporter {
    const auth = {
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
    };

    return createTransport(new MailjetTransport({ auth }));
  }
}
