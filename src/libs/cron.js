const cron = require('node-cron');
const producthunt = require('../../data/producthunt');
const rewrite = require('../../data/rewrite');



// Schedule the function to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('running node-cron for collecting link...');
    await producthunt.collectLink();           
});

cron.schedule('1 0 * * *', async () => {
    console.log('running node-cron for getting data...');
    await producthunt.getData();           
});

