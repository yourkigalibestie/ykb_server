import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { routes } from './routes';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

export const buildApp = () => {
    const app = express();

    const allowedOrigins = (env.ALLOWED_ORIGINS || env.CORS_ORIGIN || '*')
        .split(',')
        .map((origin) => origin.trim().replace(/\/$/, ''))
        .filter(Boolean);

    const isWildcard = allowedOrigins.includes('*');

    const corsOptions: cors.CorsOptions = {
        origin: (origin, callback) => {
            // Allow server-to-server, curl, mobile apps, or when wildcard is enabled
            if (!origin || isWildcard) {
                return callback(null, true);
            }
            const normalized = origin.replace(/\/$/, '');
            if (allowedOrigins.includes(normalized)) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} is not allowed by CORS`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    };

    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('combined'));

    app.get('/health', (_req, res) => res.json({ ok: true }));

    app.use('/api', routes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
