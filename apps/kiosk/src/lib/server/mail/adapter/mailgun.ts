import { env } from '$env/dynamic/private';
import type { Transporter } from 'nodemailer';
import { createTransport } from 'nodemailer';
import { default as createMailgunTransport } from 'nodemailer-mailgun-transport';
import { NodemailerAdapter } from './adapter';

export class MailgunAdapter extends NodemailerAdapter
{
  public setupTransport(): Transporter {
    const auth = {
      api_key: env.MAILGUN_API_KEY as string,
      domain: env.MAILGUN_DOMAIN as string,
    };

    return createTransport( createMailgunTransport( { auth } ) );
  }
}
