import { env } from '$env/dynamic/private';
import type Mail from 'nodemailer/lib/mailer';
import type { Adapter } from './adapter/adapter';
import { CloudflareAdapter } from "./adapter/cloudflare";
import { MailgunAdapter } from "./adapter/mailgun";
import { MailjetAdapter } from './adapter/mailjet';
import { NoOpAdapter } from "./adapter/noop";

export async function sendMail(
	platform: Readonly<App.Platform> | undefined,
	mail: Mail.Options
): Promise<void> {
	await resolveAdapter( env.MAIL_ADAPTER ).sendMail( platform, mail );
}

function resolveAdapter( adapterType: string ): Adapter {
	let adapter: Adapter;

	switch ( adapterType ) {
		case 'mailjet':
			adapter = new MailjetAdapter();
			break;

		case 'mailgun':
			adapter = new MailgunAdapter();
			break;

		case 'cloudflare':
			adapter = new CloudflareAdapter();
			break;

		case 'noop':
			adapter = new NoOpAdapter();
			break;

		default:
			throw new Error( `Unknown adapter "${ adapterType }"` );
	}

	return adapter;
}
