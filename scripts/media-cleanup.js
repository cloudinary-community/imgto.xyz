require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const CLOUD_CONFIGS = [
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },
];

(async function run() {
  for ( let i = 0, configsLength = CLOUD_CONFIGS.length; i < configsLength; i++ ) {
    const config = CLOUD_CONFIGS[i];
    console.log(`---- Begin ${config.cloud_name} ----`);

    cloudinary.config(config);

    const moderations = await getAllModerations();

    console.log('moderations', moderations.map(({ public_id }) => public_id).join(', '))

    const expiredAssets = moderations.filter(({ public_id, created_at }) => {
      const timeSinceCreated = new Date().getTime() - new Date(created_at).getTime();
      // If the asset is older than 5 minutes, we want to delete it
      return timeSinceCreated / 1000 / 60 > 5;
    });

    await deleteModerations(expiredAssets);

    console.log(`---- End ${config.cloud_name} ----`);
  }
})();

/**
 * getAllModerations
 */

async function getAllModerations() {
  try {
    const moderations = await Promise.all(['image', 'raw', 'video'].map(async type => {
      const results = await cloudinary.api.resources_by_moderation('manual', 'pending', {
        max_results: 500,
        resource_type: type
      });
      return results.resources;
    }));

    return moderations.flat();
  } catch(e) {
    console.log(`Failed to get all moderations`, e);
  }
}

/**
 * deleteModerations
 */

async function deleteModerations(moderations) {

  const moderationsByType = moderations.reduce((accum, curr) => {
    if ( !accum[curr.resource_type] ) {
      accum[curr.resource_type] = [];
    }
    accum[curr.resource_type].push(curr);
    return accum;
  }, {});

  try {
    await Promise.all(Object.keys(moderationsByType).map(async resourceType => {
      const moderations = moderationsByType[resourceType];

      if ( moderations.length > 0 ) {
        console.log(`Deleting ${moderations.length} moderations...`);

        const resourceIds = moderations.map(({ public_id }) => public_id);

        // Can only delete 100 items at a time

        const chunkSize = 100;
        const results = [];

        // https://stackoverflow.com/a/68172013
        for (let i = 0; i < Math.ceil(resourceIds.length / chunkSize); i++) {
          const chunk = resourceIds.slice(i * chunkSize, ( i + 1 ) * chunkSize);
          console.log(`Deleting chunk with ${chunk.length} items.`);
          const chunkResults = await cloudinary.api.delete_resources(chunk, {
            resource_type: resourceType
          });
          results.push(chunkResults);
        }

        const deletedIds = Object.keys(results.flatMap(({ deleted }) => deleted));

        if ( deletedIds.length !== moderations.length ) {
          const notDeleted = deletedIds.filter(id => !moderations.includes(id));
          console.log(`IDs ${notDeleted.join(', ')} not deleted.`);
        }
      } else {
        console.log('No moderations to delete...');
      }

    }));
  } catch(e) {
    console.log(`Failed to delete all moderations`, e);
  }
}