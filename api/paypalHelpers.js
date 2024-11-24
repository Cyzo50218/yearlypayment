
const base = "https://api-m.sandbox.paypal.com";

const fetch = (await import('node-fetch')).default;

let PAYPAL_CLIENT_ID = 'AdchnSRplQeuN4_MaZwIFzhl4iQ_nFP7ARTZnfJ3E7H-_rPbnLpsbKgdLf098LVoSFipi-q9Y3NE5N3C';
let PAYPAL_CLIENT_SECRET = 'ECKXWQ9tGIVi0uVC5bAHlR_rYLiaC9klMEmb5TTO4a1ZeNd02Q9c9bSJ2L6J1M7TJYaWIfmzp8Wf4fB-';
export const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch access token: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    throw error;
  }
};

export const handleResponse = async (response) => {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    console.error("Failed to parse JSON response:", errorMessage);
    throw new Error(`Failed to parse response: ${errorMessage}`);
  }
};

// Create Subscription Plan with 3-Day Free Trial and Weekly Recurring Charge
export const createPlan = async () => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/plans`;

    const payload = {
      product_id: "PROD-2JR26432UV750654L",  // Replace this with your actual product ID
      name: "Weekly Subscription Plan",
      description: "Weekly subscription plan with 3-day free trial",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "WEEK",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 2,
          total_cycles: 0,  // 0 means indefinite billing cycles
          pricing_scheme: {
            fixed_price: {
              value: "59",
              currency_code: "PHP"
            }
          }
        },
        {
          frequency: {
            interval_unit: "DAY",
            interval_count: 3
          },
          tenure_type: "TRIAL",
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: {
            fixed_price: {
              value: "0",
              currency_code: "PHP"
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "PHP"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      }
    };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create subscription plan: ${errorText}`);
    }

    const planData = await handleResponse(response);

    // Extract the plan ID from the response
    const planId = planData.jsonResponse.id;
    console.log(`Plan ID: ${planId}`);

    return planId;  // Return the plan ID for further use
  } catch (error) {
    console.error("Failed to create subscription plan:", error);
    throw error;
  }
};

// Create Subscription
export const createSubscription = async (planId) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions`;

    const payload = {
      plan_id: planId,  // Use the plan ID created by PayPal
    };

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create subscription: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    throw error;
  }
};

// Capture Subscription
export const captureSubscription = async (subscriptionID) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v1/billing/subscriptions/${subscriptionID}/capture`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to capture subscription: ${errorText}`);
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to capture subscription:", error);
    throw error;
  }
};
