export interface Adapter
{
  get<T>( platform: Readonly<App.Platform> | undefined, key: string ): Promise<T | undefined>;

  set(
    platform: Readonly<App.Platform> | undefined,
    key: string,
    value: unknown,
    ttl?: number
  ): Promise<void>;

  remove( platform: Readonly<App.Platform> | undefined, key: string ): Promise<void>;
}
