import { PrismaClient } from '../generated/prisma/client';
const prisma = new PrismaClient();

async function main() {
	const initial = 250_000_00;

	await prisma.bankState.upsert({
		where: { id: 1 },
		update: {},
		create: {
			id: 1,
			balance: initial,
		},
	});
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
