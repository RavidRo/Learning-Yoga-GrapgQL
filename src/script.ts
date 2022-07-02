import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const newLink = await prisma.link.create({
		data: {
			url: 'https://www.prisma.io/',
			description: 'Prisma client and server made easy.',
		},
	});

	const allLinks = await prisma.link.findMany();
	console.log(allLinks);
}

main().finally(() => prisma.$disconnect());
