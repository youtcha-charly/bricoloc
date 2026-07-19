<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $token;
    public string $email;

    public function __construct(string $token, string $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'BricoLoc - Reset Your Password',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    public function attachments(): array
    {
        return [];
    }

    private function buildHtml(): string
    {
        $resetUrl = 'http://localhost:8081/reset-password?token=' . $this->token . '&email=' . urlencode($this->email);

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6F6;font-family:Arial,sans-serif;">
<div style="max-width:480px;margin:30px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
  <div style="background:#0B3D3E;padding:24px;text-align:center;">
    <div style="display:inline-block;background:#D9A441;color:#0B3D3E;font-weight:700;font-size:20px;padding:8px 14px;border-radius:8px;">BL</div>
    <h1 style="color:white;font-size:20px;margin:12px 0 0;">BricoLoc</h1>
  </div>
  <div style="padding:30px;">
    <h2 style="color:#1A1A1A;font-size:18px;text-align:center;">Reset Your Password</h2>
    <p style="color:#6B7280;font-size:14px;text-align:center;line-height:22px;">
      We received a request to reset the password for your account <strong>{$this->email}</strong>.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="{$resetUrl}" style="display:inline-block;background:#D9A441;color:#0B3D3E;font-weight:700;font-size:15px;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Reset Password
      </a>
    </div>
    <p style="color:#9CA3AF;font-size:12px;text-align:center;">
      If you didn't request this, you can safely ignore this email.<br>
      This link expires in 60 minutes.
    </p>
  </div>
  <div style="background:#FAFBFC;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
    <p style="color:#9CA3AF;font-size:11px;margin:0;">BricoLoc &copy; 2026 &mdash; Connecting clients with handymen</p>
  </div>
</div>
</body>
</html>
HTML;
    }
}
