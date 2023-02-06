import type { StorageAdapter } from "@project-kiosk/types";

export class AwsAdapter implements StorageAdapter {
  public readFile(
    platform: Readonly<App.Platform> | undefined,
    path: string
  ): Promise<ReadableStream> {
    return Promise.reject(new Error("Not implemented yet"));
  }

  public removeDirectory(
    platform: Readonly<App.Platform> | undefined,
    path: string
  ): Promise<void> {
    return Promise.reject(new Error("Not implemented yet"));
  }

  public unlink(
    platform: Readonly<App.Platform> | undefined,
    path: string
  ): Promise<void> {
    return Promise.reject(new Error("Not implemented yet"));
  }

  public writeFile(
    platform: Readonly<App.Platform> | undefined,
    path: string,
    content:
      | string
      | ArrayBuffer
      | Iterable<string>
      | AsyncIterable<string>
      | ReadableStream
  ): Promise<void> {
    return Promise.reject(new Error("Not implemented yet"));
  }
}
