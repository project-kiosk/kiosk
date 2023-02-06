import { env } from '$env/dynamic/private';
import { STORAGE_ADAPTER } from '$env/static/private';
import type { Adapter } from '$lib/server/storage/adapter/adapter';
import { CloudflareR2Adapter } from '$lib/server/storage/adapter/cloudflare-r2';
import { NodeAdapter } from '$lib/server/storage/adapter/node';

export function writeFile(
	platform: Readonly<App.Platform> | undefined,
	path: string,
	content: string | ArrayBuffer | ReadableStream
): Promise<void> {
	return resolveAdapter(STORAGE_ADAPTER).writeFile(platform, path, content);
}

export function readFile<T = any>(
	platform: Readonly<App.Platform> | undefined,
	path: string
): Promise<ReadableStream<T>> {
	return resolveAdapter(STORAGE_ADAPTER).readFile(platform, path);
}

export function unlink(platform: Readonly<App.Platform> | undefined, path: string): Promise<void> {
	return resolveAdapter(STORAGE_ADAPTER).unlink(platform, path);
}

export function removeDirectory(
	platform: Readonly<App.Platform> | undefined,
	path: string
): Promise<void> {
	return resolveAdapter(STORAGE_ADAPTER).removeDirectory(platform, path);
}

function resolveAdapter(adapterType: string): Adapter {
	let adapter: Adapter;

	switch (adapterType) {
		case 'node':
			adapter = new NodeAdapter();
			break;

		case 'cloudflare':
			adapter = new CloudflareR2Adapter(env.STORAGE_BUCKET_NAME as string);
			break;

		default:
			throw new Error(`Unknown adapter "${adapterType}"`);
	}

	return adapter;
}
