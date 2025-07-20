export default {
	project_name: 'digitalnaKomora',
	namespace: 'digitalnaKomora',
    api_url:
         process.env.API_ENDPOINT === 'production'
			? 'https://api.digitalnakomora.ba/api/v1'
			: process.env.API_ENDPOINT === 'local'
			? 'http://188.124.203.32:7766/api/v1'
			: process.env.API_ENDPOINT === 'staging'
			? 'https://staging-api.digitalnakomora.ba/api/v1'
			: 'http://188.124.203.32:7766/api/v1',
    image_url:
         process.env.API_ENDPOINT === 'production'
			? 'https://api.digitalnakomora.ba/images'
			: process.env.API_ENDPOINT === 'staging'
			? 'https://staging-api.digitalnakomora.ba/images'
			: 'http://188.124.203.32:7766/images',
};
