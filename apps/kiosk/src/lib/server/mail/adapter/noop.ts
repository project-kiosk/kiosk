import type Mail from 'nodemailer/lib/mailer';
import type { Adapter } from './adapter';
import { defaultOptions } from './adapter';

export class NoOpAdapter implements Adapter
{
  public sendMail( platform: Readonly<App.Platform> | undefined, mail: Mail.Options ): Promise<void> {
    console.info( 'No-Op Mail adapter: Would send email', {
      ...defaultOptions,
      ...mail
    } );

    return Promise.resolve( undefined );
  }
}
