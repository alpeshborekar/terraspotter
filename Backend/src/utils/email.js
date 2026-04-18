const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"TerraSpotter" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your TerraSpotter password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })
}

module.exports = { sendPasswordResetEmail }