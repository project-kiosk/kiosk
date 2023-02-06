export function createStreamFromArrayBuffer(
  buffer: ArrayBuffer,
  chunkSize = 64 * 1024
): ReadableStream<Uint8Array> {
  return new ReadableStream( {
    start( controller ) {
      const bytes = new Uint8Array( buffer );
      for ( let readIndex = 0; readIndex < bytes.byteLength; ) {
        controller.enqueue( bytes.subarray( readIndex, ( readIndex += chunkSize ) ) );
      }

      controller.close();
    }
  } );
}

export async function createArrayBufferFromStream(
  stream: ReadableStream<Uint8Array>
): Promise<ArrayBuffer> {
  let result   = new Uint8Array( 0 );
  const reader = stream.getReader();

  while ( true ) {
    const { done, value } = await reader.read();

    if ( done ) {
      break;
    }

    const newResult = new Uint8Array( result.length + value.length );

    newResult.set( result );
    newResult.set( value, result.length );

    result = newResult;
  }

  return result.buffer;
}
