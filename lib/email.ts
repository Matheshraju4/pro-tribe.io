import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME = process.env.FROM_NAME;

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactNode
) {
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject: subject,
    react: react,
  });

  return { data, error };
}
