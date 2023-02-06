import { createStreamFromArrayBuffer, createArrayBufferFromStream } from "@project-kiosk/utils";
import type { StorageAdapter } from "@project-kiosk/types";
import { mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { dirname, normalize } from "node:path";

export class NodeAdapter implements StorageAdapter {
  private readonly storagePath: string;

  public constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  public async writeFile(
    platform: Readonly<App.Platform> | undefined,
    path: string,
    content:
      | string
      | ArrayBuffer
      | Iterable<string>
      | AsyncIterable<string>
      | ReadableStream
  ): Promise<void> {
    const fullPath = this.resolvePath(path);
    let data =
      content instanceof ReadableStream
        ? new Uint8Array(await createArrayBufferFromStream(content))
        : content instanceof ArrayBuffer
        ? new Uint8Array(content)
        : content;

    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, data);
  }

  public async readFile(
    platform: Readonly<App.Platform> | undefined,
    path: string
  ): Promise<ReadableStream> {
    const fullPath = this.resolvePath(path);
    const content = await readFile(fullPath);

    if (!content) {
      throw new Error(`No such file: ${path}`);
    }

    return createStreamFromArrayBuffer(content.buffer);
  }

  public async unlink(
    platform: Readonly<App.Platform> | undefined,
    path: string
  ): Promise<void> {
    const fullPath = this.resolvePath(path);

    await unlink(fullPath);
  }

  public async removeDirectory(
    platform: Readonly<App.Platform> | undefined,
    path: string
  ): Promise<void> {
    const fullPath = this.resolvePath(path);

    await rm(fullPath, {
      recursive: true,
      force: true,
    });
  }

  private resolvePath(path: string): string {
    const basePath = normalize(this.storagePath);
    const fullPath = normalize(`${basePath}/${path}`);

    if (!fullPath.startsWith(basePath)) {
      throw new Error("Unsafe path: Outside of base path");
    }

    return fullPath;
  }
}
