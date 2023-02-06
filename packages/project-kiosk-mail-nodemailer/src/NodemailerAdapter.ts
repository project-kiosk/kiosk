import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export class NodemailerAdapter
{
  private readonly transport: Transporter;

  public constructor() {
    this.transport = this.setupTransport();
  }

  public async sendMail(
    platform: Readonly<App.Platform> | undefined,
    mail: Mail.Options
  ): Promise<void> {
    try {
      await this.transport.sendMail( mail );
    } catch ( error ) {
      if ( !( error instanceof Error ) ) {
        throw error;
      }

      throw new Error( `Failed to send mail: ${ error.message }` );
    }
  }

  protected setupTransport(): Transporter {
    return createTransport();
  }
}
