export interface WorkerMessage<T> {
	type: string;
	payload: T;
}

export interface WebWorker extends Worker {
	postMessage(message: WorkerMessage<any>, transfer?: Transferable[]): void;

	postMessage(message: WorkerMessage<any>, options?: StructuredSerializeOptions): void;
}

export async function loadWorker<T extends WebWorker = WebWorker>(
	module: Promise<any>
): Promise<T> {
	const Worker = await module;

	return new Worker.default();
}

export function dispatchRequest<
	D,
	M extends WorkerMessage<D> = WorkerMessage<D>,
	T extends string = M['type']
>(worker: WebWorker, type: T, payload: D, transferables: Transferable[] = []): void {
	const message: WorkerMessage<D> = { type, payload };

	worker.postMessage(message, transferables);
}

export async function expectResponse<
	D,
	M extends WorkerMessage<D> = WorkerMessage<D>,
	T = M['type']
>(worker: WebWorker, expectedType: T): Promise<D> {
	return new Promise((resolve, reject) => {
		worker.addEventListener('message', (event: MessageEvent<M>) => {
			const { type, payload } = event.data;

			if (type !== expectedType) {
				reject(new Error(`Unexpected message type ${type}`));
			}

			resolve(payload);
		});
	}) as Promise<D>;
}

export async function workerOperation<
	D,
	E,
	Request extends WorkerMessage<D> = WorkerMessage<D>,
	Response extends WorkerMessage<E> = WorkerMessage<E>,
	T extends string = Request['type'] & Response['type']
>(module: Promise<any>, type: T, request: D, transferables?: Transferable[]): Promise<E> {
	const worker = await loadWorker<WebWorker>(module);

	dispatchRequest<D>(worker, type, request, transferables);

	const response: E = await expectResponse<E>(worker, type);

	worker.terminate();

	return response;
}
