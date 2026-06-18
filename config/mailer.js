const nodemailer = require('nodemailer');

const createTransporter = () => {
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn("SMTP configuration details are missing in the .env file. E-mail dispatching will run in dry-run mode.");
      return null;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // True for 465, false for others
      auth: {
        user,
        pass
      }
    });

    return transporter;
  } catch (error) {
    console.error("Failed to initialize Nodemailer SMTP transporter:", error.message);
    return null;
  }
};

const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"NXUS Footwear" <${process.env.SMTP_USER || 'no-reply@nxus.com'}>`,
    to: email,
    subject: `NXUS | OTP Verification Code: ${otp}`,
    html: `
      <div style="background-color: #000; color: #fff; font-family: 'Inter', sans-serif; padding: 3rem 2rem; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1.5px solid #ff5b01;">
        <h1 style="font-family: 'Outfit', sans-serif; color: #ff5b01; font-size: 2.5rem; text-align: center; margin-bottom: 2rem; letter-spacing: 2px;">NXUS<span>.</span></h1>
        <p style="font-size: 1.1rem; line-height: 1.6; color: #e2e2e2;">Hi ${name || 'User'},</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #e2e2e2; margin-bottom: 2rem;">
          Welcome to the future of footwear. Use the verification code below to verify your email address and activate your account.
        </p>
        <div style="background-color: rgba(255, 91, 1, 0.1); border: 2px solid #ff5b01; text-align: center; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
          <span style="font-size: 2.2rem; font-weight: 800; color: #AAFF00; letter-spacing: 6px; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 0.85rem; color: #a3a3a3; text-align: center; margin-top: 2rem;">
          This OTP code is valid for 10 minutes. If you did not request this verification, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.15); margin: 2rem 0;">
        <p style="font-size: 0.75rem; color: #737373; text-align: center;">
          &copy; 2026 NXUS Labs Inc. Built with premium kinetic design guidelines.
        </p>
      </div>
    `
  };

  if (!transporter) {
    console.log(`[DRY-RUN MAIL] Sending OTP ${otp} to ${email}`);
    return { dryRun: true, otp };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending OTP email to ${email}: ${error.message}`);
    // Return standard object to avoid breaking flow
    return { error: true, message: error.message };
  }
};

module.exports = { sendOTPEmail };
