<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $link;
    public $ccRecipients;

    public function __construct(string $name, string $link, array $ccRecipients)
    {
        $this->name = $name;
        $this->link = $link;
        $this->ccRecipients = $ccRecipients;
    }

    public function build()
    {
        $email = $this->subject("Set Your Password")
                    ->view('emails.user_invite'); 

         if (!empty($this->ccRecipients)) {
            $email->cc($this->ccRecipients);
        }

        return $email;

    }
}
