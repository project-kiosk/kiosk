import type { Adapter } from './adapter';

export class NodeAdapter implements Adapter
{
  private store: Map<string, unknown>;

  public constructor() {
    this.store = new Map();
  }

  public get<T>( platform: Readonly<App.Platform> | undefined, key: string ): Promise<T | undefined> {
    const expiration = this.store.get( this.getExpirationKey( key ) );

    if ( expiration && this.getTimestamp() <= expiration ) {
      return this.remove( platform, key ).then( () => undefined );
    }

    return Promise.resolve( this.store.get( key ) as T );
  }

  public remove( platform: Readonly<App.Platform> | undefined, key: string ): Promise<void> {
    this.store.delete( key );
    this.store.delete( this.getExpirationKey( key ) );

    return Promise.resolve();
  }

  public set(
    platform: Readonly<App.Platform> | undefined,
    key: string,
    value: unknown,
    ttl?: number
  ): Promise<void> {
    this.store.set( key, value );

    if ( ttl ) {
      this.store.set( this.getExpirationKey( key ), this.getTimestamp() + ttl );
    }

    return Promise.resolve( undefined );
  }

  private getExpirationKey( key: string ): string {
    return key + '_exp';
  }

  private getTimestamp(): number {
    return Math.floor( new Date().getTime() / 1000 );
  }
}
