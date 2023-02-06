import type { BookData, EpubFile } from '$lib/epub/parser';
import { parse } from '$lib/epub/parser';
import { unzip } from '$lib/server/epub/utilities';

export async function parseFile( path: string ): Promise<BookData> {
  // TODO: Is checking the file extension actually useful?
  //       We could also check the magic bytes for `50 4B 03 04`
  if ( path.split( '.' ).pop() !== 'epub' ) {
    throw new Error( 'File extension is invalid' );
  }

  const files: EpubFile[] = ( await unzip( path ) ).map(
    ( entry ): EpubFile => ( {
      ...entry,
      name: entry.name,
      size: entry.size,
      type: entry.type,
      lastModified: entry.lastModified.getTime(),
      arrayBuffer: () => entry.arrayBuffer(),
      text: () => entry.text()
    } )
  );

  return parse( files );
}
