const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const tunnel = require('tunnel');
const qs = require('qs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { VGS_VAULT_ID, VGS_USERNAME, VGS_PASSWORD, STRIPE_KEY } = process.env;

function getProxyAgent() {
    const vgs_outbound_url = `${VGS_VAULT_ID}.sandbox.verygoodproxy.com`;
    return tunnel.httpsOverHttps({
        proxy: {
            host: vgs_outbound_url,
            port: 8443,
            proxyAuth: `${VGS_USERNAME}:${VGS_PASSWORD}`
        },
    });
}

async function postStripePayment(creditCardInfo) {
    let agent = getProxyAgent();
    let expiry = creditCardInfo['card-expiration-date'].split('/');

    let base64Auth = Buffer.from(`${STRIPE_KEY}:`).toString('base64');

    const instance = axios.create({
        baseURL: 'https://api.stripe.com',
        headers: {
            'authorization': `Basic ${base64Auth}`,
        },
        httpsAgent: agent,
    });

    let pm_response = await instance.post('/v1/payment_methods', qs.stringify({
        type: 'card',
        card: {
            number: creditCardInfo['card-number'],
            cvc: creditCardInfo['card-security-code'],
            exp_month: expiry[0].trim(),
            exp_year: expiry[1].trim()
        }
    }));

    let pi_response = await instance.post('/v1/payment_intents', qs.stringify({
        amount: 1000, // Amount in cents
        currency: 'usd',
        payment_method: pm_response.data.id,
        confirm: true
    }));

    return pi_response.data;
}

app.post('/process-payment', async (req, res) => {
    try {
        const creditCardInfo = req.body;
        const paymentResult = await postStripePayment(creditCardInfo);
        res.json({ success: true, paymentResult });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
