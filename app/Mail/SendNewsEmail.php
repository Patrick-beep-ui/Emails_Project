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

    /**
     * Create a new message instance.
     */
    public function __construct(string $htmlContent, string $subject = "Top News") 
    {
        $this->htmlContent = $htmlContent;
        $this->subject($subject);
    }

    /**
     * Get the message envelope.
     */

    public function build()
    {
        return $this->subject($this->subject . " News")
                    ->html($this->htmlContent);
    }
}
