const express = require('express');
const stripe = require('stripe')('sk_test_51P4gaDP3zlq0Z21j88E1KCzm1r9jrJdyudZUjqICxklQ9i2g04BlphgTWKU0RFwQYzVTw82VdFDzJ3cC55Y8yQuV00lfK3retx');

const cors = require('cors');

import bodyParser from 'body-parser';


const port = 4000;
const app = express();

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    next();
});

// Parses the text as url encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Parses the text as json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World, from express');
})

app.post('/stripe_checkout', async (req, res) => {
    const stripeToken = req.body.stripeToken;
    const cantidad = req.body.cantidad;

    const cantidadInMad = Math.round(cantidad * 100); // Conversion en centimes
    try {
        const chargeObject = await stripe.charges.create({
            amount: cantidadInMad,
            currency: 'mad', // Devise MAD pour dirham marocain
            source: stripeToken,
            capture: false,
            description: 'plan',
            receipt_email: 'lailatimasli1@gmail.com'
        });

        await stripe.charges.capture(chargeObject.id);
        res.json(chargeObject);
    } catch (error) {
        await stripe.refunds.create({ charge: chargeObject.id });
        res.status(500).json({ error: 'Payment failed, and refund issued.' });
    }
});

app.listen(port, function () {
    console.log("Server is listening at port:" + port);
});
