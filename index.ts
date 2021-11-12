import d = require('axios');
import affinities = require('./affinities.json');
import APIResponse from './lib/interfaces/APIResponse';
import { token } from './config.json';
const axios = d.default;

const affinitiesMap = new Map<string, number>();
const affinitiesArray = affinities._state.userAffinties;

// Rate limit: 30 requests per 30s (one run uses ten)
(async () => {
    for (let i = 0; i < 10; i++) {
        const res = await axios.get(`https://discord.com/api/v9/users/${affinitiesArray[i].user_id}`, { headers: { Authorization: `Bot ${token}` } });
        if (res.status === 429) { // rate limit hit
            console.log("Rate limit hit, aborting");
            return;
        }
        if (res.status >= 300 && res.status < 400) continue;
        const data: APIResponse = res.data;
        affinitiesMap.set(`${data.username}#${data.discriminator}`, Math.floor(affinitiesArray[i].affinity));
        if (i == 9) {
            console.log(`Remaining runs before rate limit: ${parseInt(res.headers['x-ratelimit-remaining']) / 10}\n`);
            console.log("===== AFFINITIES =====");
        }
    }
    const sortedResult = [...affinitiesMap.entries()].sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < sortedResult.length; i++) {
        console.log(`${i + 1}: ${sortedResult[i][0]} (${sortedResult[i][1]})`);
    }
})();
