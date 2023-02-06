import { env } from '$env/dynamic/private';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

export interface Adapter
{
	sendMail( platform: Readonly<App.Platform> | undefined, mail: Mail.Options ): Promise<void>;
}

export const defaultOptions:Partial<Mail.Options> = {
		from: {
			address: env.MAIL_SENDER_ADDRESS || 'no-reply@kiosk.invalid',
			name: env.MAIL_SENDER_NAME || 'Kiosk'
		}
	};

export abstract class NodemailerAdapter implements Adapter
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
			await this.transport.sendMail( {
				...defaultOptions,
				...mail
			} );
		} catch ( error ) {
			if ( !( error instanceof Error ) ) {
				throw error;
			}

			throw new Error( `Failed to send mail: ${ error.message }` );
		}
	}

	abstract setupTransport(): Transporter;
}
