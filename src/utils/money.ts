import { Prisma } from '@prisma/client';

export const decimalFromString = (value: string): Prisma.Decimal => {
    return new Prisma.Decimal(value);
};

export const calcFeeFromBps = (amount: Prisma.Decimal, feeBps: number): Prisma.Decimal => {
    // platformFee = amount * (bps / 10000)
    const amt = new Prisma.Decimal(amount.toString());
    const fee = amt.mul(new Prisma.Decimal(feeBps)).div(new Prisma.Decimal(10_000));
    return fee;
};
