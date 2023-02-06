export interface StorageAdapter
{
  writeFile(
    platform: Readonly<App.Platform> | undefined,
    path: string,
    content: string | ArrayBuffer | Iterable<string> | AsyncIterable<string> | ReadableStream
  ): Promise<void>;

  readFile( platform: Readonly<App.Platform> | undefined, path: string ): Promise<ReadableStream>;

  unlink( platform: Readonly<App.Platform> | undefined, path: string ): Promise<void>;

  removeDirectory( platform: Readonly<App.Platform> | undefined, path: string ): Promise<void>;
}
