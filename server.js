const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const allowedOrigins = ['http://localhost:4200', 'https://tudominio.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const stripe = require("stripe")(process.env.STRIPE_TEST_KEY);

app.get('/', (req, res, next) => {
  res.status(200).json({message: '🗿 Yes...'})
})


app.post("/checkout", async (req, res, next) => {
  try {
    const success_url = `${process.env.FRONTEND_BASE_URL}/thanks`;
    const cancel_url = `${process.env.FRONTEND_BASE_URL}/cart`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free shipping',
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'usd',
            },
            display_name: 'Next day air',
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 1,
              },
            }
          }
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.product]
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url,
      cancel_url,
    });

    res.status(200).json(session);
  } catch (error) {
    next(error);
    res.status(400).json({ 'message': 'Algo salio mal...' });
  }
});

app.listen(4242, () => console.log('app is running on port 4242'));