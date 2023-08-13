// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
//Install dotenv
//Install twilio
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.verifySid;
const client = require("twilio")(accountSid, authToken);


client.verify.v2
  .services(verifySid)
  .verifications.create({ to: "+50684301066", channel: "sms" })
  .then((verification) => console.log(verification.status))
  .then(() => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question("Please enter the OTP:", (otpCode) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: "+50684301066", code: otpCode })
        .then((verification_check) => console.log(verification_check.status))
        .then(() => readline.close());
        
    });
  });