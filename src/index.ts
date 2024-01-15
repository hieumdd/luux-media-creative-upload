import express from 'express';
import bodyParser from 'body-parser';

import { logger } from './logging.service';
import { handleCreativeUpload } from './creative-upload/creative-upload.service';

const app = express();

app.use(bodyParser.json());

app.use(({ method, path, body }, res, next) => {
    logger.info({ method, path, body });
    res.on('finish', () => {
        logger.debug({ method, path, body, status: res.statusCode });
    });
    next();
});

app.use('/', (req, res) => {
    handleCreativeUpload(req.body)
        .then(() => res.status(200).end())
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

app.listen(8080);
