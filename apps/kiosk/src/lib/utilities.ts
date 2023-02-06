import { decode, encode } from 'blurhash';
import type { Action } from 'svelte/action';

export function generateRandomString( length: number ): string {
  // noinspection SpellCheckingInspection
  const characters =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZqeytrpolkadjsghfgmnbzxcvnQPOWEYRKASJHDGFMNBCV' +
          'Xjsfhrlg124903564576986483658fgh4sdfh687e4h897WETHJ68F7G468847' +
          '1877GFHJFFGJ87469857468746hfghwrtiyj4598yhdjkhgnk';

  return Array( length )
  .fill( undefined )
  .reduce(
    ( carry, _ ) => carry + characters.charAt( Math.floor( Math.random() * characters.length ) ),
    ''
  );
}

export function sleep( ms: number ): Promise<void> {
  return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

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

export async function getImageDimensions(
  image: string | ArrayBuffer
): Promise<{ width: number; height: number }> {
  if ( typeof image === "string" ) {
    return new Promise( ( resolve, reject ) => {
      const img = new Image();
      img.src   = image;

      img.addEventListener( "error", ( error ) => reject( error ) );
      img.addEventListener( "load", () =>
        resolve( {
          width: img.width,
          height: img.height
        } )
      );
    } );
  }

  const { width, height } = await createImageBitmap( new Blob( [ image ] ), {} );

  return { width, height };
}

/**
 * Encodes a blur hash for a given image.
 *
 * @param buffer
 * @param context
 * @see https://blurha.sh/
 */
export async function encodeImageToBlurHash(
  buffer: Blob | ArrayBuffer | HTMLImageElement,
  context: CanvasDrawImage & CanvasImageData
): Promise<string> {
  buffer       = buffer instanceof ArrayBuffer ? new Blob( [ buffer ] ) : buffer;
  const bitmap = await createImageBitmap( buffer, {} );

  context.drawImage( bitmap, 0, 0 );

  const { data, width, height } = context.getImageData( 0, 0, bitmap.width, bitmap.height );

  return encode( data, width, height, 4, 3 );
}

export async function decodeBlurHashToImage(
  hash: string,
  resolution: number = 32
): Promise<Blob | null> {
  const pixels            = decode( hash, 242, 415 );
  const canvas            = document.createElement( "canvas" );
  const { width, height } = canvas;
  const context           = canvas.getContext( "2d" ) as CanvasRenderingContext2D;
  const imageData         = context.createImageData( width, height );

  imageData.data.set( pixels );
  context.putImageData( imageData, 0, 0 );

  return new Promise( ( resolve ) => canvas.toBlob( ( blob ) => resolve( blob ) ) );
}

export function humanReadableFileSize( size: number ): string {
  const i: number    = size == 0 ? 0 : Math.floor( Math.log( size ) / Math.log( 1024 ) );
  const unit: string = [ "B", "kB", "MB", "GB", "TB" ][ i ];

  return Number( ( size / Math.pow( 1024, i ) ).toFixed( 2 ) ) + " " + unit;
}

/** Dispatch event on click outside of node */
export const clickOutside: Action = function clickOutside( node: HTMLElement ) {
  const handleClick = ( event: Event ) => {
    if ( node && !node.contains( event.target as HTMLElement ) && !event.defaultPrevented ) {
      node.dispatchEvent(
        new CustomEvent( "click_outside", {
          detail: { node }
        } )
      );
    }
  };

  document.addEventListener( "click", handleClick, true );

  return {
    destroy() {
      document.removeEventListener( "click", handleClick, true );
    }
  };
}

export const sticky: Action = function sticky( node: HTMLElement, { stickToTop }: { stickToTop: boolean } ) {
  const stickySentinelTop = document.createElement( "div" );
  stickySentinelTop.classList.add( "stickySentinelTop" );
  stickySentinelTop.style.position = "absolute";
  stickySentinelTop.style.height   = "1px";
  node.parentNode?.prepend( stickySentinelTop );

  const stickySentinelBottom = document.createElement( "div" );
  stickySentinelBottom.classList.add( "stickySentinelBottom" );
  stickySentinelBottom.style.position = "absolute";
  stickySentinelBottom.style.height   = "1px";
  node.parentNode?.append( stickySentinelBottom );

  const mutationObserver = new MutationObserver( mutations => mutations.forEach( () => {
    const { parentNode: topParent }    = stickySentinelTop;
    const { parentNode: bottomParent } = stickySentinelBottom;

    if ( stickySentinelTop !== topParent?.firstChild ) {
      topParent?.prepend( stickySentinelTop );
    }

    if ( stickySentinelBottom !== bottomParent?.lastChild ) {
      bottomParent?.append( stickySentinelBottom );
    }
  } ) );

  mutationObserver.observe( node.parentNode as HTMLElement, { childList: true } );

  const intersectionObserver = new IntersectionObserver( ( entries ) => {
    const entry = entries[ 0 ];
    let isStuck = !entry.isIntersecting && isValidYPosition( entry );
    node.dispatchEvent( new CustomEvent( "stuck", {
      detail: {
        isStuck
      }
    } ) );
  }, {} );

  const isValidYPosition = ( { target, boundingClientRect }: IntersectionObserverEntry ): boolean =>
    target === stickySentinelTop
    ? boundingClientRect.y < 0
    : boundingClientRect.y > 0;

  intersectionObserver.observe( stickToTop ? stickySentinelTop : stickySentinelBottom );

  return {
    update(): void {
      if ( stickToTop ) {
        intersectionObserver.unobserve( stickySentinelBottom );
        intersectionObserver.observe( stickySentinelTop );
      } else {
        intersectionObserver.unobserve( stickySentinelTop );
        intersectionObserver.observe( stickySentinelBottom );
      }
    },

    destroy(): void {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    }
  };
};
