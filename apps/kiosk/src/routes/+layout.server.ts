import { getJwtCookie, verifyAccessToken } from '$lib/server/auth/utilities';
import type { LayoutServerLoad } from './$types';

export type AuthData =
	| { isAuthenticated?: false; user?: never }
	| { isAuthenticated: true; user: { name: string; email: string } };

// noinspection JSUnusedGlobalSymbols
export const load: LayoutServerLoad<AuthData> = async ({ cookies }) => {
	try {
		const { name, email } = verifyAccessToken(getJwtCookie(cookies) || '');

		return { isAuthenticated: true, user: { name, email } };
	} catch {
		return { isAuthenticated: false };
	}
};
