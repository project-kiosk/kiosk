import type { KVNamespace } from '@cloudflare/workers-types';
import type { Adapter } from './adapter';

type CloudflarePlatformEnv<Namespace extends string> = Record<Namespace, KVNamespace>;

export class CloudflareAdapter implements Adapter {
	private readonly namespace: string;

	public constructor(namespace: string) {
		this.namespace = namespace;
	}

	public async get<T>(
		platform: Readonly<App.Platform> | undefined,
		key: string
	): Promise<T | undefined> {
		const value = await this.resolveKVNamespace(platform).get(key);

		return (value as T) || undefined;
	}

	public async set(
		platform: Readonly<App.Platform> | undefined,
		key: string,
		value: unknown,
		ttl?: number
	): Promise<void> {
		const safeValue =
			typeof value === 'string' || value instanceof ArrayBuffer ? value : JSON.stringify(value);

		await this.resolveKVNamespace(platform).put(key, safeValue, {
			expirationTtl: ttl
		});
	}

	public async remove( platform: Readonly<App.Platform> | undefined, key: string): Promise<void> {
		await this.resolveKVNamespace(platform).delete(key);
	}

	private resolveKVNamespace(platform: Readonly<App.Platform> | undefined): KVNamespace {
		if (!platform || !('env' in platform)) {
			throw new Error('Cloudflare adapter can only be used in Cloudflare Workers');
		}

		const env: CloudflarePlatformEnv<typeof this.namespace> = (platform as any).env as any;

		if (!(this.namespace in env)) {
			throw new Error(`No such bucket: ${this.namespace}`);
		}

		return env[this.namespace];
	}
}
