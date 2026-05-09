import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from './prismaEnums';

export type JwtPayload = {
    sub: string;
    role: Role;
};

export const signAccessToken = (payload: JwtPayload): string => {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
