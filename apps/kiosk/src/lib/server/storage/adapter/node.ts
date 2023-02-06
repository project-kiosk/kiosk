import { env } from '$env/dynamic/private';
import type { Adapter } from '$lib/server/storage/adapter/adapter';
import { createArrayBufferFromStream, createStreamFromArrayBuffer } from '$lib/utilities';
import { mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { dirname, normalize } from 'node:path';

export class NodeAdapter implements Adapter
{
	async writeFile(
		platform: Readonly<App.Platform> | undefined,
		path: string,
		content: string | ArrayBuffer | Iterable<string> | AsyncIterable<string> | ReadableStream
	): Promise<void> {
		const fullPath = this.resolvePath( path );
		let data       =
					content instanceof ReadableStream
					? new Uint8Array( await createArrayBufferFromStream( content ) )
					: content instanceof ArrayBuffer
						? new Uint8Array( content )
						: content;

		await mkdir( dirname( fullPath ), { recursive: true } );
		await writeFile( fullPath, data );
	}

	async readFile(
		platform: Readonly<App.Platform> | undefined,
		path: string
	): Promise<ReadableStream> {
		const fullPath = this.resolvePath( path );
		const content  = await readFile( fullPath );

		if ( !content ) {
			throw new Error( `No such file: ${ path }` );
		}

		return createStreamFromArrayBuffer( content.buffer );
	}

	async unlink( platform: Readonly<App.Platform> | undefined, path: string ): Promise<void> {
		const fullPath = this.resolvePath( path );

		await unlink( fullPath );
	}

	async removeDirectory( platform: Readonly<App.Platform> | undefined, path: string ): Promise<void> {
		const fullPath = this.resolvePath( path );

		await rm( fullPath, {
			recursive: true,
			force: true
		} );
	}

	private resolvePath( path: string ): string {
		const basePath = normalize( env.STORAGE_PATH );
		const fullPath = normalize( `${ basePath }/${ path }` );

		if ( !fullPath.startsWith( basePath ) ) {
			throw new Error( 'Unsafe path: Outside of base path' );
		}

		return fullPath;
	}
}
