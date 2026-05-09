import { env } from './config/env';
import { buildApp } from './app';

const app = buildApp();

app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${env.PORT}`);
});
