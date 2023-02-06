import {
	createArrayBufferFromStream,
	encodeImageToBlurHash,
	getImageDimensions
} from '$lib/utilities';
import type { WorkerMessage } from '$lib/workers/workers';
import { workerOperation } from '$lib/workers/workers';

onmessage = async ({ data }: MessageEvent<WorkerMessage<any>>) => {
	let response: WorkerMessage<any>;
	let transfer: Transferable[] = [];

	switch (data.type) {
		case 'dimensions':
			response = {
				type: 'dimensions',
				payload: await dimensions(data.payload)
			};
			break;

		case 'blurhash':
			response = {
				type: 'blurhash',
				payload: await blurhash(data.payload)
			};
			break;

		default:
			throw new Error(`Unhandled message type ${data.type}`);
	}

	postMessage(response, { transfer });
};

async function dimensions({ image }: DimensionsRequest): Promise<DimensionsResponse> {
	const data = image instanceof ReadableStream ? await createArrayBufferFromStream(image) : image;
	const { width, height } = await getImageDimensions(data);

	return { width, height };
}

export interface DimensionsRequest {
	image: ArrayBuffer | ReadableStream;
}

export interface DimensionsResponse {
	width: number;
	height: number;
}

async function blurhash({ canvas, data }: BlurhashRequest): Promise<BlurhashResponse> {
	const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
	const hash = await encodeImageToBlurHash(data, context);

	return { hash };
}

export interface BlurhashRequest {
	canvas: OffscreenCanvas;
	data: ArrayBuffer;
}

export interface BlurhashResponse
{
	hash: string;
}
