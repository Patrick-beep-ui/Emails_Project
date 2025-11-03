<!DOCTYPE html>
<html>
  <body>
    <h2>Hello {{ $name }},</h2>
    <p>Your News Emailer account has been created. Please set your password using the link below:</p>
    <a href="{{ $url }}" style="display:inline-block;background-color:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">
      Set Your Password
    </a>
    <p>This link will expire in 24 hours.</p>
  </body>
</html>
