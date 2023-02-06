import { NodemailerAdapter } from "@project-kiosk/mail-nodemailer";
import { createTransport, Transporter } from "nodemailer";
import { default as createMailgunTransport } from "nodemailer-mailgun-transport";

export class MailgunAdapter extends NodemailerAdapter
{
  private readonly apiKey: string;
  private readonly domain: string;

  public constructor( apiKey: string, domain: string ) {
    super();
    this.apiKey = apiKey;
    this.domain = domain;
  }

  public setupTransport(): Transporter {
    const auth = {
      api_key: this.apiKey,
      domain: this.domain,
    };

    return createTransport( createMailgunTransport( { auth } ) );
  }
}
