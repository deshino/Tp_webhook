const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { handleGithubWebhook } = require('./github-webhook');

const app = express();
const PORT = config.port || 3000;

app.use(bodyParser.json());

app.post('/webhook', handleGithubWebhook);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});