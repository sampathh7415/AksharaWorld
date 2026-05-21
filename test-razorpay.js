require('dotenv').config({ path: './.env.local' });

async function testRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  console.log(`Using Key: ${keyId?.substring(0, 10)}...`);

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  
  try {
    const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      headers: { Authorization: `Basic ${auth}` }
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Data Items Count:", data.items?.length);
    return response.status === 200;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

testRazorpay().then(ok => {
  console.log("Result:", ok ? "SUCCESS" : "FAILED");
  process.exit(ok ? 0 : 1);
});
