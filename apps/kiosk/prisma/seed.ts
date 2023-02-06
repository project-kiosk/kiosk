import { PrismaClient } from '@prisma/client';
import { md5 } from 'hash-wasm';

const prisma = new PrismaClient();

async function main() {
	await prisma.user.deleteMany();
	await prisma.book.deleteMany();
	await prisma.author.deleteMany();

	await prisma.user.create({
		data: {
			name: 'Moritz',
			email: 'm@9dev.de',
			passwordHash: await md5('1234')
		}
	});

	await prisma.author.create({
		data: {
			name: 'Brandon Sanderson',
			books: {
				create: [
					{ title: 'The Way of Kings' },
					{ title: 'Words of Radiance' },
					{ title: 'Oathbringer' },
					{ title: 'Rhythm of War' },
					{ title: 'Elantris' },
					{ title: 'The Emperor’s Soul' },
					{ title: 'Warbreaker' },
					{ title: 'The Hero of Ages' },
					{ title: 'Mistborn' },
					{ title: 'The Alloy of Law' },
					{ title: 'The Well of Ascension' }
				]
			}
		}
	});

	await prisma.author.create({
		data: {
			name: 'Patrick Rothfuss',
			books: {
				create: [{ title: 'The Name of the Wind' }, { title: 'The Wise Man’s Fear' }]
			}
		}
	});

	await prisma.author.create({
		data: {
			name: 'George R. R. Martin',
			books: {
				create: [
					{ title: 'A Game of Thrones' },
					{ title: 'A Clash of Kings' },
					{ title: 'A Storm of Swords' },
					{ title: 'A Feast for Crows' },
					{ title: 'A Dance with Dragons' }
				]
			}
		}
	});

	await prisma.author.create({
		data: {
			name: 'J. R. R. Tolkien',
			books: {
				create: [
					{ title: 'The Fellowship of the Ring' },
					{ title: 'The Two Towers' },
					{ title: 'The Return of the King' }
				]
			}
		}
	});

	await prisma.author.create({
		data: {
			name: 'Robert Jordan',
			books: {
				create: [
					{ title: 'The Eye of the World' },
					{ title: 'The Great Hunt' },
					{ title: 'The Dragon Reborn' },
					{ title: 'The Shadow Rising' },
					{ title: 'The Fires of Heaven' },
					{ title: 'Lord of Chaos' },
					{ title: 'A Crown of Swords' },
					{ title: 'The Path of Daggers' },
					{ title: 'Winter’s Heart' },
					{ title: 'Crossroads of Twilight' },
					{ title: 'Knife of Dreams' },
					{ title: 'The Gathering Storm' },
					{ title: 'Towers of Midnight' },
					{ title: 'A Memory of Light' }
				]
			}
		}
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
