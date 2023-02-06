import { env } from '$env/dynamic/private';
import prisma from '$lib/prisma';
import { sendMail } from '$lib/server/mail/mail';
import { generateRandomString } from '$lib/utilities';
import type { AuthenticatorChallenge, User } from '@prisma/client';
import type { Cookies } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

const defaultSessionIdCookieName = 'ksid';
const defaultJwtCookieName = 'jwt';

interface AccessTokenPayload extends JwtPayload {
	name: string;
	email: string;
}

export function issueAccessToken(user: User): string {
	const payload: Partial<AccessTokenPayload> = {
		name: user.name,
		email: user.email
	};

	return jwt.sign(payload, env.JWT_SECRET, {
		subject: user.id
	});
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	const { payload } = jwt.verify(token, env.JWT_SECRET, {
		complete: true
	});

	if (typeof payload === 'string') {
		throw new Error('Unexpected token payload');
	}

	return payload as AccessTokenPayload;
}

export function resolveSessionId(cookies: Cookies): string {
	let sessionId = getSessionIdCookie(cookies);

	if (!sessionId) {
		sessionId = generateSessionId();

		setSessionIdCookie(cookies, sessionId);
	}

	return sessionId;
}

export function generateSessionId(): string {
	return generateRandomString(16);
}

export function setSessionIdCookie(cookies: Cookies, sessionId: string): void {
	const name = env.SESSION_ID_COOKIE_NAME || defaultSessionIdCookieName;

	cookies.set(name, sessionId, {
		path: '/auth',
		maxAge: 60 * 5,
		httpOnly: true,
		sameSite: 'strict'
	});
}

export function getSessionIdCookie(cookies: Cookies): string | undefined {
	const name = env.SESSION_ID_COOKIE_NAME || defaultSessionIdCookieName;

	return cookies.get(name);
}

export function setJwtCookie(cookies: Cookies, token: string): void {
	const name = env.JWT_COOKIE_NAME || defaultJwtCookieName;

	cookies.set(name, token, {
		path: '/',
		secure: false,
		httpOnly: true
	});
}

export function getJwtCookie(cookies: Cookies): string | undefined {
	const name = env.JWT_COOKIE_NAME || defaultJwtCookieName;

	return cookies.get(name);
}

export function resolveUserId(cookies: Cookies): string | undefined {
	try {
		const { sub } = verifyAccessToken(getJwtCookie(cookies) || '');

		return sub;
	} catch {
		return undefined;
	}
}

export async function resolveUser(cookies: Cookies): Promise<User | null> {
	const id = resolveUserId(cookies);

	if (!id) {
		return null;
	}

	return prisma.user.findUnique({
		where: { id }
	});
}

export function generateRandomPassCode(length: number): string {
	return ('' + Math.random()).substring(2, length + 2);
}

export function inferNameFromEmailAddress(emailAddress: string): string {
	const mailbox = emailAddress

		// Pick anything before the last @ character ("foo\@bar@test.com" -> "foo\@bar")
		.slice(0, emailAddress.lastIndexOf('@'))

		// Remove any + modifiers
		.split('+')[0];

	let name = mailbox

		// Replace any numbers, underscores, or dots with spaces
		.replace(/[-_.\d]+/g, ' ')

		// Replace duplicate whitespace with a single one
		.replace(/\s\s+/g, ' ')

		.trim();
	// Title case
	// `john smith` to `John Smith`
	name = name
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	// Handle Generational (The Third) names
	// `John Smith Iii` to `John Smith III`
	['ii', 'iii', 'iv'].forEach((suffix) => {
		const rx = new RegExp(`\\s(${suffix})$`, 'gi');

		name = name.replace(rx, (s) => s.toUpperCase());
	});

	// Handle 'Jr/Sr' names
	// `John Smith Jr` to `John Smith, Jr.`
	['jr', 'jnr', 'sr', 'snr'].forEach((suffix) => {
		name = name.replace(new RegExp('\\s(' + suffix + ')$', 'gi'), (s) => `,${s}.`);
	});

	// Handle title prefixes names
	// `Dr John Smith` to `Dr. John Smith`
	['mr', 'mrs', 'ms', 'dr', 'prof'].forEach((prefix) => {
		name = name.replace(new RegExp(`^(${prefix})\\s`, 'gi'), (s) => s.replace(' ', '. '));
	});

	// Handle "son/daughter" of pattern
	name = name
		.replace(/\bAl(?=\s+\w)/g, 'al') // al Arabic or forename Al.
		.replace(/\bAp\b/g, 'ap') // ap Welsh.
		.replace(/\bBen(?=\s+\w)\b/g, 'ben') // ben Hebrew or forename Ben.
		.replace(/\bDell([ae])\b/g, 'dell$1') // della and delle Italian.
		.replace(/\bD([aeiu])\b/g, 'd$1') // da, de, di Italian; du French.
		.replace(/\bDe([lr])\b/g, 'de$1') // del Italian; der Dutch/Flemish.
		.replace(/\bEl\b/g, 'el') // el Greek
		.replace(/\bLa\b/g, 'la') // la French
		.replace(/\bL([eo])\b/g, 'l$1') // lo Italian; le French.
		.replace(/\bVan(?=\s+\w)/g, 'van') // van German or forename Van.
		.replace(/\bVon\b/g, 'von'); // von Dutch/Flemish

	// Handle 'Mc' names
	// `Marty Mcfly` to `Marty McFly`
	name = name.replace(/Mc(.)/g, (m, m1) => `Mc${m1.toUpperCase()}`);

	// Handle 'O'Connor' type names
	// `Flannery O'connor` to `Flannery O'Connor`
	name = name.replace(/[A-Z]'(.)/g, (m, m1) => `O'${m1.toUpperCase()}`);

	return name;
}

export async function dispatchPassCode(user: User, code: string): Promise<void> {
	console.log(`WOULD SEND EMAIL TO ${user.email}: CODE ${code}`);
	return;

	// noinspection UnreachableCodeJS
	await sendMail({
		to: user.email,
		subject: 'Verify passcode',
		text:
			`Kiosk\r\n=====\r\nHi ${user.name}!\r\nYour verification code:\r\n` +
			`${code}\r\n\r\nAccess to your account isn't possible without this ` +
			`code, even if it hasn't been requested by you.\r\n\r\nThis email ` +
			`has been sent to ${user.email}.`
	});
}

export async function resolveCurrentChallenge(sessionIdentifier: string): Promise<string> {
	let resolved: Pick<AuthenticatorChallenge, 'id' | 'expiresAt' | 'challenge'>;

	try {
		resolved = await prisma.authenticatorChallenge.findFirstOrThrow({
			where: { sessionIdentifier },
			select: { id: true, challenge: true, expiresAt: true },
			orderBy: { createdAt: 'desc' }
		});
	} catch (error) {
		throw new Error('Unexpected state: No challenge generated yet');
	}

	const { id, expiresAt, challenge } = resolved;

	if (expiresAt <= new Date()) {
		await prisma.authenticatorChallenge.delete({ where: { id } });

		throw new Error('Challenge has expired. Please try again.');
	}

	return challenge;
}

export async function cleanChallenges(sessionIdentifier: string): Promise<void> {
	await prisma.authenticatorChallenge.deleteMany({
		where: { sessionIdentifier }
	});
}
