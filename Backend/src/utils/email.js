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

const sendDigestEmail = async (email, name, data) => {
  await transporter.sendMail({
    from: `"TerraSpotter" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `TerraSpotter Daily Digest — ${data.date}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Here's your TerraSpotter daily summary for ${data.date}:</p>
      <table style="border-collapse:collapse;width:100%;max-width:400px">
        <tr style="background:#f0fdf4">
          <td style="padding:12px;border:1px solid #d1fae5">New Plantations</td>
          <td style="padding:12px;border:1px solid #d1fae5;font-weight:bold">${data.newPlantations}</td>
        </tr>
        <tr>
          <td style="padding:12px;border:1px solid #d1fae5">Completed Today</td>
          <td style="padding:12px;border:1px solid #d1fae5;font-weight:bold">${data.completedToday}</td>
        </tr>
        <tr style="background:#f0fdf4">
          <td style="padding:12px;border:1px solid #d1fae5">Trees Planted Today</td>
          <td style="padding:12px;border:1px solid #d1fae5;font-weight:bold">${data.treesPlantedToday}</td>
        </tr>
      </table>
      <p style="margin-top:24px;color:#6b7280">TerraSpotter — Mapping the right place to plant</p>
    `,
  })
}

module.exports = { sendPasswordResetEmail, sendDigestEmail }