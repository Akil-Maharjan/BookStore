import nodemailer from 'nodemailer';

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const sendContactEmail = async ({ name, email, message }) => {
  const host = requiredEnv('SMTP_HOST');
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = requiredEnv('SMTP_USER');
  const pass = requiredEnv('SMTP_PASS');
  const to = process.env.CONTACT_TO || 'akilmaharjan44@gmail.com';

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: {
      name: 'BookStore Contact Form',
      address: user,
    },
    to,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: message,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
  });
};
