import { sendContactEmail } from '../utils/mailer.js';

export const submitContact = async (req, res) => {
  const { name, email, message } = req.body;

  await sendContactEmail({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  });

  res.status(200).json({ message: 'Message sent successfully.' });
};
