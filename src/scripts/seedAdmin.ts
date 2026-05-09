import 'dotenv/config';

import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import { Role } from '../utils/prismaEnums';

const DEFAULT_EMAIL = 'admin@yourkigalibestie.com';
const DEFAULT_PASSWORD = 'Admin@2026';
const DEFAULT_NAME = 'Admin';

const email = (process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
const name = (process.env.SEED_ADMIN_NAME ?? DEFAULT_NAME).trim();
const resetPassword = process.env.SEED_ADMIN_RESET_PASSWORD === '1' || process.env.SEED_ADMIN_RESET_PASSWORD === 'true';

const isDbUnreachable = (err: unknown): boolean => {
    const anyErr = err as any;
    const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
    const message = typeof anyErr?.message === 'string' ? anyErr.message : '';
    return code === 'P1001' || message.includes("Can't reach database server");
};

async function main() {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: Role.ADMIN
            }
        });

        // eslint-disable-next-line no-console
        console.log(`Seeded admin user: ${user.email} (role=${user.role})`);
        return;
    }

    const updates: { role?: Role; passwordHash?: string; name?: string } = {};

    if (existing.role !== Role.ADMIN) updates.role = Role.ADMIN;
    if (existing.name !== name && name.length > 0) updates.name = name;

    if (resetPassword) {
        updates.passwordHash = await hashPassword(password);
    }

    if (Object.keys(updates).length === 0) {
        // eslint-disable-next-line no-console
        console.log(`Admin user already exists: ${existing.email} (no changes)`);
        return;
    }

    const updated = await prisma.user.update({ where: { email }, data: updates });

    // eslint-disable-next-line no-console
    console.log(
        `Admin user updated: ${updated.email} (role=${updated.role})` +
            (resetPassword ? ' (password reset)' : '')
    );
}

main()
    .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to seed admin user');

        if (isDbUnreachable(err)) {
            // eslint-disable-next-line no-console
            console.error('Database not reachable. Check DATABASE_URL, network/VPN, and that the DB is running.');
            // eslint-disable-next-line no-console
            console.error('Tip: to force-reset the password, set SEED_ADMIN_RESET_PASSWORD=true');
        } else {
            // eslint-disable-next-line no-console
            console.error(err);
        }

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
