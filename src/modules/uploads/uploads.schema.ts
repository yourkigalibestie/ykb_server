import { z } from 'zod';

// Multipart uploads are validated by multer; schema kept for module consistency.
export const emptySchema = z.object({});
