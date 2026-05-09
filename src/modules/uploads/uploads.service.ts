import { AppError } from '../../utils/appError';
import type { UploadResult } from './uploads.types';
import { cloudinary } from '../../config/cloudinary';
import { Readable } from 'stream';

export const uploadsService = {
    uploadImage: async (file: Express.Multer.File | undefined, folder: string): Promise<UploadResult> => {
        if (!file) throw new AppError('File is required', 400, 'VALIDATION_ERROR');
        if (!file.mimetype.startsWith('image/')) {
            throw new AppError('Only image uploads are supported', 400, 'VALIDATION_ERROR');
        }

        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error('Upload failed'));
                    return resolve({ secure_url: (result as any).secure_url, public_id: (result as any).public_id });
                }
            );

            Readable.from(file.buffer).pipe(stream);
        });

        return { url: uploadResult.secure_url, publicId: uploadResult.public_id };
    }
};
