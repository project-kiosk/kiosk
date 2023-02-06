import { env } from '$env/dynamic/private';
import type { Transporter } from 'nodemailer';
import { createTransport } from 'nodemailer';
import { MailjetTransport } from 'nodemailer-mailjet-transport';
import { NodemailerAdapter } from './adapter';

export class MailjetAdapter extends NodemailerAdapter
{
  public setupTransport(): Transporter {
    const auth = {
      apiKey: env.MAILJET_API_KEY as string,
      apiSecret: env.MAILJET_API_SECRET as string
    };

    return createTransport( new MailjetTransport( { auth } ) );
  }
}
