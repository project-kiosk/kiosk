import { createStreamFromArrayBuffer } from '$lib/utilities';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { StorageAdapter } from '@project-kiosk/types';

type CloudflarePlatformEnv<Bucket extends string> = Record<Bucket, R2Bucket>;

export class CloudflareR2Adapter implements StorageAdapter {
	private readonly bucketName: string;

	public constructor(bucketName: string) {
		this.bucketName = bucketName;
	}

	async writeFile(
		platform: Readonly<App.Platform> | undefined,
		path: string,
		content: string | ArrayBuffer | ReadableStream
	): Promise<void> {
		// Cloudflare defines its own ReadableStream
		type CloudflareContent<T extends string | ArrayBuffer | ReadableStream> =
			T extends ReadableStream ? any : T;

		await this.resolveBucket(platform).put(path, content as CloudflareContent<typeof content>);
	}

	async readFile(
		platform: Readonly<App.Platform> | undefined,
		path: string
	): Promise<ReadableStream> {
		const content = await this.resolveBucket(platform).get(path);

		if (!content) {
			throw new Error(`No such file: ${path}`);
		}

		return createStreamFromArrayBuffer(await content.arrayBuffer());
	}

	async unlink(platform: Readonly<App.Platform> | undefined, path: string): Promise<void> {
		await this.resolveBucket(platform).delete(path);
	}

	async removeDirectory(platform: Readonly<App.Platform> | undefined, path: string): Promise<void> {
		//  no-op
	}

	private resolveBucket(platform: Readonly<App.Platform> | undefined): R2Bucket {
		if (!platform || !('env' in platform)) {
			throw new Error('Cloudflare R2 adapter can only be used in Cloudflare Workers');
		}

		const env: CloudflarePlatformEnv<typeof this.bucketName> = (platform as any).env;

		if (!(this.bucketName in env)) {
			throw new Error(`No such bucket: ${this.bucketName}`);
		}

		return env[this.bucketName];
	}
}
