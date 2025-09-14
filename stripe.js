const Stripe = require("stripe");

// IMPORTANT: Replace this with your Restricted Stripe API key from the dashboard
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { priceId, customerEmail } = req.body;

    if (!priceId || !customerEmail) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Create a customer
    const customer = await stripe.customers.create({
      email: customerEmail,
    });

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).json(subscription);
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};
