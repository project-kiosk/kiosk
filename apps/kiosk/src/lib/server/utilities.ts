import { sha256 } from 'hash-wasm';

interface ErrorObject {
	title: string;
	detail?: string;
	id: string;
	links?: {
		about?: string;
		type?: string;
	};
	status: string;
	code?: string;
	source?: {
		pointer?: string;
		parameter?: string;
		header?: string;
	};
	meta?: Record<string, any>;
}

interface ErrorResponse {
	errors: ErrorObject[];
}

type ErrorSpec =
	| string
	| string[]
	| Omit<ErrorObject, 'status' | 'id'>
	| Omit<ErrorObject, 'status' | 'id'>[];

export async function errorResponse(
	status: number,
	error: ErrorSpec,
	headers?: Record<string, string | string[]>
): Promise<Response> {
	// TODO: Fix this bullshit
	const id = await sha256(new Date().toISOString());
	const errors: Omit<ErrorObject, 'status' | 'id'>[] = [];

	if (typeof error === 'string') {
		errors.push({ title: error });
	} else if (!Array.isArray(error)) {
		errors.push(error);
	} else {
		for (const item in error) {
			errors.push(typeof item === 'string' ? { title: item } : item);
		}
	}

	const body: ErrorResponse = {
		errors: errors.map((error) => ({
			...error,
			status: status.toString(),
			id
		}))
	};

	return jsonResponse(body, status, headers);
}

export function jsonResponse(
	body: any,
	status: number = 200,
	headers?: Record<string, string | string[]>
): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json',
			...(headers || {})
		}
	});
}
