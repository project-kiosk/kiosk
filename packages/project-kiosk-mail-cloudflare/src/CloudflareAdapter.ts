import { MailAdapter } from "@project-kiosk/types";
import type Mail from "nodemailer/lib/mailer";

const defaultMailChannelsApiUrl = "https://api.mailchannels.net/tx/v1/send";

export class CloudflareAdapter implements MailAdapter {
  private readonly apiUrl: string;

  public constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || defaultMailChannelsApiUrl;
  }

  public async sendMail(
    platform: Readonly<App.Platform> | undefined,
    mail: Mail.Options
  ): Promise<void> {
    const from = this.resolveSender(mail);
    const to = this.resolveRecipient(mail);
    const subject = this.resolveSubject(mail);
    const content = this.resolveContent(mail);

    const request = new Request(this.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to }],
        from,
        subject,
        content,
      }),
    });

    await fetch(request);
  }

  private resolveContent(
    mail: Mail.Options
  ): { type: string; value: string }[] {
    const values: { type: string; value: string }[] = [];

    if (mail.text) {
      values.push({
        type: "text/plain",
        value: mail.text.toString(),
      });
    }

    if (mail.html) {
      values.push({
        type: "text/plain",
        value: mail.html.toString(),
      });
    }

    return values;
  }

  private resolveSender(mail: Mail.Options): AddressInfo {
    if (!mail.from) {
      throw new Error("Missing sender information from mail");
    }

    if (typeof mail.from === "string") {
      return { email: mail.from };
    }

    const email = mail.from.address;
    const name = mail.from.name;

    return { email, name };
  }

  private resolveSubject(mail: Mail.Options): string | undefined {
    return mail.subject;
  }

  private resolveRecipient(mail: Mail.Options): AddressInfo[] {
    function resolve(to: Mail.Options["to"]): AddressInfo[] {
      if (!to) {
        throw new Error("Missing recipient information from mail");
      }

      if (Array.isArray(to)) {
        return to.flatMap((item) => resolve(item));
      }

      if (typeof to === "string") {
        return [{ email: to }];
      }

      const email = to.address;
      const name = to.name;

      return [{ email, name }];
    }

    return resolve(mail.to);
  }
}

type AddressInfo = { email: string; name?: string };
