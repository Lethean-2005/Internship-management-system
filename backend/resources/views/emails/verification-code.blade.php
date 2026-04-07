<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e1b4b,#2d2b5e);padding:32px 40px;text-align:center;">
                            <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700;">Internship Management</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hello <strong>{{ $userName }}</strong>,</p>
                            <p style="color:#6b7280;font-size:14px;margin:0 0 28px;line-height:1.5;">Use the following verification code to verify your email address:</p>

                            <div style="text-align:center;margin:0 0 28px;">
                                <div style="display:inline-block;background:#f0f4ff;border:2px solid #e0e7ff;border-radius:10px;padding:16px 32px;letter-spacing:12px;font-size:32px;font-weight:800;color:#1e1b4b;">
                                    {{ $code }}
                                </div>
                            </div>

                            <p style="color:#9ca3af;font-size:13px;margin:0 0 4px;text-align:center;">This code will expire in <strong>10 minutes</strong>.</p>
                            <p style="color:#9ca3af;font-size:13px;margin:0;text-align:center;">If you didn't request this, please ignore this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
                            <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; {{ date('Y') }} Internship Management System</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
