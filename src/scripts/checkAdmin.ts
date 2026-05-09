import 'dotenv/config';

import { prisma } from '../config/prisma';

const DEFAULT_EMAIL = 'admin@yourkigalibestie.com';
const email = (process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();

const isDbUnreachable = (err: unknown): boolean => {
    const anyErr = err as any;
    const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
    const message = typeof anyErr?.message === 'string' ? anyErr.message : '';
    return code === 'P1001' || message.includes("Can't reach database server");
};

async function main() {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        // eslint-disable-next-line no-console
        console.log(`Admin user NOT found for email: ${email}`);
        process.exitCode = 2;
        return;
    }

    // eslint-disable-next-line no-console
    console.log('Admin user found:');
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(user, null, 2));
}

main()
    .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to check admin user');

        if (isDbUnreachable(err)) {
            // eslint-disable-next-line no-console
            console.error('Database not reachable. Check DATABASE_URL, network/VPN, and that the DB is running.');
        } else {
            // eslint-disable-next-line no-console
            console.error(err);
        }

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
