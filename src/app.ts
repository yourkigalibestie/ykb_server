import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { routes } from './routes';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

export const buildApp = () => {
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('combined'));

    app.get('/health', (_req, res) => res.json({ ok: true }));

    app.use('/api', routes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
