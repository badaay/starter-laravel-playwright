@component('mail::message')
# Two-Factor Authentication Code

Your two-factor authentication code is:

@component('mail::panel')
<div style="font-size: 24px; text-align: center; letter-spacing: 8px; font-weight: bold;">{{ $code }}</div>
@endcomponent

This code will expire in 10 minutes.

If you did not request this code, please ignore this email or contact support if you have concerns about your account security.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
