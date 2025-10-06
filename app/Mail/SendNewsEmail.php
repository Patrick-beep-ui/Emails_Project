<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendNewsEmail extends Mailable
{
    use Queueable, SerializesModels;

    public string $htmlContent;
    public array $ccRecipients;

    /**
     * Create a new message instance.
     */
    public function __construct(string $htmlContent, string $subject = "Top News", array $ccRecipients = []) 
    {
        $this->htmlContent = $htmlContent;
        $this->subject($subject);
        $this->ccRecipients = $ccRecipients;
    }

    /**
     * Get the message envelope.
     */

    public function build()
    {
        $email = $this->subject($this->subject)
        ->html($this->htmlContent);

        if (!empty($this->ccRecipients)) {
        $email->cc($this->ccRecipients);
        }

        return $email;
    }
}
