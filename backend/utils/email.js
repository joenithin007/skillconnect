let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    return transporter;
  } catch { return null; }
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({ from: `"SIST SkillConnect" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) { console.log('Email failed:', err.message); }
};

const emailTemplates = {
  requestAccepted: (studentName, projectTitle) => ({
    subject: `🎉 Your application was accepted - ${projectTitle}`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
      <h2 style="color:#6c63ff">🎉 Application Accepted!</h2>
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>Your application for <strong>${projectTitle}</strong> has been <span style="color:green">accepted</span>!</p>
      <p>Login to SIST SkillConnect to get started.</p>
      <a href="${process.env.FRONTEND_URL||'https://sistskillconnect.netlify.app'}" style="background:#6c63ff;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:1rem">Open SkillConnect</a>
      <p style="color:#999;font-size:0.75rem;margin-top:2rem">SIST SkillConnect · Sathyabama Institute of Science and Technology</p>
    </div>`
  }),
  requestRejected: (studentName, projectTitle) => ({
    subject: `Application update - ${projectTitle}`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>Your application for <strong>${projectTitle}</strong> was not selected this time. Keep applying!</p>
    </div>`
  }),
  friendRequest: (senderName, receiverName) => ({
    subject: `${senderName} sent you a connection request on SIST SkillConnect`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
      <p>Hi <strong>${receiverName}</strong>,</p>
      <p><strong>${senderName}</strong> wants to connect with you on SIST SkillConnect.</p>
      <a href="${process.env.FRONTEND_URL||'https://sistskillconnect.netlify.app'}/friends">View request →</a>
    </div>`
  }),
};

module.exports = { sendEmail, emailTemplates };
