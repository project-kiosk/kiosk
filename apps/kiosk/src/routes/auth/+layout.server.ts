import { resolveSessionId } from '$lib/server/auth/utilities';
import type { LayoutServerLoad } from './$types';

interface AuthSessionData {
	sessionId: string;
}

export const load: LayoutServerLoad<AuthSessionData> = async ({ cookies }) => {
	const sessionId = resolveSessionId(cookies);

	return { sessionId };
};
