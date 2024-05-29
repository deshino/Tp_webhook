const crypto = require('crypto');
const { exec } = require('child_process');
const config = require('./config');

function verifyGithubSignature(req, res, buf, encoding) {
    const signature = req.headers['x-hub-signature'];
    if (!signature) {
        console.log("Signature missing");
        return res.status(401).send('Signature missing');
    }

    const hmac = crypto.createHmac('sha1', config.githubSecret);
    const digest = Buffer.from('sha1=' + hmac.update(buf).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, checksum)) {
        console.log("Signature mismatch");
        return res.status(401).send('Signature mismatch');
    }
}

function handleGithubWebhook(req, res) {
    const event = req.body;
    console.log("Received event:", JSON.stringify(event, null, 2));

    if (event.ref === `refs/heads/${config.githubBranch}`) {
        console.log(`Changes detected on branch: ${config.githubBranch}`);
        exec('git pull && npm install && npm run build', (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error}`);
                return;
            }
            console.log(`Stdout: ${stdout}`);
            console.error(`Stderr: ${stderr}`);
        });
    } else {
        console.log("Event not related to the monitored branch");
    }

    res.status(200).send('Webhook received');
}

module.exports = {
    handleGithubWebhook,
    verifyGithubSignature
};