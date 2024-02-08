import { logger } from '../logging.service';
import { storage } from '../storage.service';
import { CreativeUploadBody } from './creative-upload.type';

export const handleCreativeUpload = async (payload: CreativeUploadBody) => {
    const bucket = storage.bucket(payload.bucket);
    const stagingFile = bucket.file(payload.name);

    const [exists] = await stagingFile.exists();
    const contentTypeMatch = payload.contentType.match(/image\/.*/);
    const stagingFileNameMatch = payload.name.match(/staging\/(.*)/);

    if (!exists || !contentTypeMatch! || !stagingFileNameMatch) {
        logger.debug({
            message: 'Skipping file',
            details: { exists, contentTypeMatch, stagingFileNameMatch },
        });
        return;
    }

    const [_, fileName] = stagingFileNameMatch;

    logger.debug({ message: 'fileName', details: { fileName } });

    const liveFile = bucket.file(`live/${fileName}`);

    await stagingFile.move(liveFile.name);

    const [__, fn] = fileName.match(/(.*)\..*/)!;
    const data = {
        file_name: fn,
        public_url: liveFile.publicUrl(),
        created_at: payload.timeCreated,
    };
    logger.debug({ message: 'Data', details: { data } });

    await bucket.file(`metadata/${fn}.json`).save(JSON.stringify(data));
};
