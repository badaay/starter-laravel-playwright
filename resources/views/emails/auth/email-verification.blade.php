@component('mail::message')
# Email Verification Code

@if($purpose === 'verification')
Your email verification code is:
@elseif($purpose === 'password_reset')
Your password reset verification code is:
@elseif($purpose === 'email_change')
Your email change verification code is:
@elseif($purpose === 'account_deletion')
Your account deletion verification code is:
@else
Your security verification code is:
@endif

@component('mail::panel')
<div style="font-size: 28px; text-align: center; letter-spacing: 10px; font-weight: bold; color: #2563eb;">{{ $code }}</div>
@endcomponent

This code will expire in **10 minutes**.

@if($purpose === 'verification')
Please use this code to verify your email address and complete your account setup.
@elseif($purpose === 'password_reset')
Please use this code to confirm your password reset request.
@elseif($purpose === 'email_change')
Please use this code to confirm your email address change.
@elseif($purpose === 'account_deletion')
**Warning**: This code will confirm account deletion. This action cannot be undone.
@else
Please use this code to verify your identity for this security-sensitive action.
@endif

## Security Notice

- Do not share this code with anyone
- This code is only valid for 10 minutes
- You have 3 attempts to enter the correct code
- If you did not request this code, please ignore this email

If you continue to receive verification codes that you did not request, please contact our support team immediately.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
