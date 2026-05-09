import type { Role } from '../utils/prismaEnums';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: Role };
      validated?: { body?: any; params?: any; query?: any };
    }
  }
}

export { };
