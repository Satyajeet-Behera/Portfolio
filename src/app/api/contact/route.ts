import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Input sanitization helper
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  phone: z
    .string()
    .min(7, { message: 'Please enter a valid contact phone number' })
    .max(20, { message: 'Contact number cannot exceed 20 characters' })
    .regex(/^[+0-9\s\-()]+$/, { message: 'Phone number contains invalid characters' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .max(120, { message: 'Email cannot exceed 120 characters' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters long' })
    .max(2500, { message: 'Message cannot exceed 2500 characters' }),
  // Honeypot field — bots fill this, humans do not
  honeypot: z.string().max(0, { message: 'Spam detected' }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMap = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          errors: errorMap,
          message: 'Validation failed. Please correct the highlighted errors.',
        },
        { status: 400 }
      );
    }

    const { name, phone, email, message, honeypot } = validationResult.data;

    // 2. Honeypot check
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Submission rejected.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || 'iq218satya@gmail.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // 3. Provider Configuration Check
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured in environment.');
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            'Email delivery is awaiting configuration of RESEND_API_KEY. Please connect directly via iq218satya@gmail.com or WhatsApp.',
        },
        { status: 503 }
      );
    }

    // 4. Send email via Resend
    const resend = new Resend(apiKey);
    const timestamp = new Date().toUTCString();

    const sanitizedName = escapeHtml(name);
    const sanitizedPhone = escapeHtml(phone);
    const sanitizedEmail = escapeHtml(email);
    const sanitizedMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    const emailResponse = await resend.emails.send({
      from: `Satyajeet Portfolio <${fromEmail}>`,
      to: [toEmail],
      replyTo: email,
      subject: `New Portfolio Inquiry — ${name}`,
      text: `New Portfolio Inquiry\n\nName: ${name}\nContact Number: ${phone}\nEmail: ${email}\nTime: ${timestamp}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f5f5f7; border: 1px solid rgba(197, 160, 89, 0.3); border-radius: 12px; padding: 32px;">
          <h2 style="color: #dfba75; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px; margin-top: 0;">New Portfolio Inquiry</h2>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px; line-height: 1.6;">
            <tr>
              <td style="color: #94949f; width: 140px; padding: 6px 0;"><strong>Sender Name:</strong></td>
              <td style="color: #ffffff;">${sanitizedName}</td>
            </tr>
            <tr>
              <td style="color: #94949f; padding: 6px 0;"><strong>Contact Number:</strong></td>
              <td style="color: #ffffff;"><a href="tel:${sanitizedPhone}" style="color: #dfba75; text-decoration: none;">${sanitizedPhone}</a></td>
            </tr>
            <tr>
              <td style="color: #94949f; padding: 6px 0;"><strong>Email Address:</strong></td>
              <td style="color: #ffffff;"><a href="mailto:${sanitizedEmail}" style="color: #dfba75; text-decoration: none;">${sanitizedEmail}</a></td>
            </tr>
            <tr>
              <td style="color: #94949f; padding: 6px 0;"><strong>Received At:</strong></td>
              <td style="color: #94949f;">${timestamp}</td>
            </tr>
          </table>
          <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #c5a059; border-radius: 4px; padding: 16px; font-size: 15px; line-height: 1.7; color: #e2e2e8;">
            ${sanitizedMessage}
          </div>
          <p style="font-size: 12px; color: #70707a; margin-top: 28px; margin-bottom: 0;">
            Sent automatically from the personal portfolio contact form of Satyajeet Behera.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend delivery error:', emailResponse.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Something went wrong while sending your message. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received. I'll get back to you soon.",
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while sending your message. Please try again.',
      },
      { status: 500 }
    );
  }
}
