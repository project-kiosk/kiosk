import { env } from '$env/dynamic/private';
import { KEY_VALUE_ADAPTER } from '$env/static/private';
import type { Adapter } from './adapter/adapter';
import { CloudflareAdapter } from './adapter/cloudflare';
import { NodeAdapter } from './adapter/node';

export function get<T>(
  platform: Readonly<App.Platform> | undefined,
  key: string
): Promise<T | undefined> {
  return resolveAdapter( KEY_VALUE_ADAPTER ).get<T>( platform, key );
}

export function set(
  platform: Readonly<App.Platform> | undefined,
  key: string,
  value: unknown,
  ttl?: number
): Promise<void> {
  return resolveAdapter( KEY_VALUE_ADAPTER ).set( platform, key, value, ttl );
}

export function remove( platform: Readonly<App.Platform> | undefined, key: string ): Promise<void> {
  return resolveAdapter( KEY_VALUE_ADAPTER ).remove( platform, key );
}

function resolveAdapter( adapterType: string ): Adapter {
  let adapter: Adapter;

  switch ( adapterType ) {
    case 'node':
      adapter = new NodeAdapter();
      break;

    case 'cloudflare':
      adapter = new CloudflareAdapter( env.KV_NAMESPACE as string );
      break;

    default:
      throw new Error( `Unknown adapter "${ adapterType }"` );
  }

  return adapter;
}
