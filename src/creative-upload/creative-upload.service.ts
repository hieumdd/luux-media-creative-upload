import { logger } from '../logging.service';
import { storage } from '../storage.service';
import { CreativeUploadBody } from './creative-upload.type';

export const handleCreativeUpload = async (payload: CreativeUploadBody) => {
    const bucket = storage.bucket(payload.bucket);
    const stagingFile = bucket.file(payload.name);

    const [exists] = await stagingFile.exists();
    const contentTypeMatch = payload.contentType.match(/image\/.*/);
    const stagingFileNameMatch = payload.name.match(/staging\/(\d+\..*)/);

    if (!exists || !contentTypeMatch! || !stagingFileNameMatch) {
        logger.debug({
            fn: 'handleCreativeUpload',
            details: { exists, contentTypeMatch, stagingFileNameMatch },
        });
        return;
    }

    const [_, fileName] = stagingFileNameMatch;
    const liveFile = bucket.file(`live/${fileName}`);

    await stagingFile.move(liveFile.name);
    await liveFile.makePublic();

    const [__, adId] = fileName.match(/(.*)\..*/)!;
    const data = {
        ad_id: adId,
        public_url: liveFile.publicUrl(),
        created_at: payload.timeCreated,
    };
    logger.debug({ fn: 'handleCreativeUpload', details: data });
    await bucket.file(`metadata/${adId}.json`).save(JSON.stringify(data));
};
