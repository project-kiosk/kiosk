import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import type { Options as YauzlOptions } from 'yauzl';
import { dosDateTimeToDate, Entry, fromBuffer, ZipFile } from 'yauzl';

const openZipArchive = promisify<Buffer, YauzlOptions, ZipFile>(fromBuffer);

/**
 * Extracts a ZIP file.
 *
 * @param path Path to the file to unzip, or buffer containing raw ZIP archive.
 * @param encoding Optional encoding to read the file as.
 * @returns Promise of zip entries.
 */
export async function unzip(
	path: string | Buffer,
	encoding: BufferEncoding = 'utf8'
): Promise<ZipEntry[]> {
	return new Promise(async (resolve, reject) => {
		let buffer: Buffer;
		let archive: ZipFile;

		try {
			buffer = Buffer.isBuffer(path) ? path : await readFile(path, null);
			archive = await openZipArchive(buffer, {
				lazyEntries: true
			});
		} catch (error) {
			return reject(error);
		}

		const openStream = promisify(archive.openReadStream.bind(archive));
		const contents: ZipEntry[] | PromiseLike<ZipEntry[]> = [];

		archive.readEntry();

		archive.on('end', () => resolve(contents));

		archive.on('entry', async (entry) => {
			if (/\/$/.test(entry.fileName)) {
				return archive.readEntry();
			}

			const readStream = await openStream(entry);
			readStream.on('end', () => archive.readEntry());

			const buffer = [];

			for await (const data of readStream) {
				buffer.push(data);
			}

			contents.push(new ZipEntry(entry, Buffer.concat(buffer)));
		});

		archive.on('error', (error) => {
			if (error) {
				return reject(error);
			}

			archive.close();
			reject(error);
		});
	});
}

export class ZipEntry<T = unknown> extends Object {
	private readonly entry: Entry;
	private readonly bytes: Buffer;

	constructor(entry: any, bytes: Buffer) {
		super();
		this.entry = entry;
		this.bytes = bytes;
	}

	get name(): string {
		return this.entry.fileName;
	}

	get size(): number {
		return this.entry.uncompressedSize;
	}

	get length(): number {
		return this.size;
	}

	get type(): string {
		return 'application/octet-stream';
	}

	get lastModified(): Date {
		return dosDateTimeToDate(this.entry.lastModFileDate, this.entry.lastModFileTime);
	}

	async arrayBuffer(): Promise<Buffer> {
		return this.bytes;
	}

	async json(): Promise<T> {
		const text = await this.text();

		return JSON.parse(text);
	}

	async text(): Promise<string> {
		return this.bytes.toString('utf-8');
	}

	toJson() {
		return {
			filename: this.name,
			size: this.size,
			lastModificationDate: this.lastModified,
			contents: this.bytes
		};
	}
}
