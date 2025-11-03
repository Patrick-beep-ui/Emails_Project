<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $url;

    public function __construct(User $user, $url)
    {
        $this->user = $user;
        $this->url = $url;
    }

    public function build()
    {
        return $this->subject('Set your account password')
                    ->view('emails.set-password')
                    ->with([
                        'name' => $this->user->first_name,
                        'url' => $this->url
                    ]);
    }
}

