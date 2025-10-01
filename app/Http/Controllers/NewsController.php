<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\News;
use App\Models\Source;
use App\Models\Email;
use App\Models\EmailContent;
use App\Models\User;

use Exception;

class NewsController extends Controller
{
    public function storeNews(array $aiResponse, array $userEmails, string $tagTitle = 'Tag')
    {
        $validator = Validator::make([
            'news' => $aiResponse,
            'emails' => $userEmails
        ], [
            'news' => 'required|array|min:1',
            'news.*.title' => 'required|string|max:255',
            'news.*.link' => 'required|url|distinct',
            'emails' => 'required|array|min:1',
            'emails.*' => 'required|email'
        ]);
    
        if ($validator->fails()) {
            return [
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()->all()
            ];
        }
    
        DB::beginTransaction();
    
        try {
            $newsIds = [];
    
            foreach ($aiResponse as $newsItem) {
                $sourceDomain = $newsItem['displayLink'] ?? 'unknown';
                $source = Source::firstOrCreate(['source_domain' => $sourceDomain]);

                // Extract date and description
                $rawSummary = $newsItem['summary'] ?? $newsItem['snippet'] ?? null;
                $publishedAt = now(); // fallback
                $description = $rawSummary;

                if ($rawSummary) {
                    // Case 1: YYYY/MM/DD - description
                    if (preg_match('/^(\d{4}\/\d{2}\/\d{2})\s*-\s*(.+)$/', $rawSummary, $matches)) {
                        $publishedAt = \Carbon\Carbon::createFromFormat('Y/m/d', $matches[1]);
                        $description = $matches[2];
                
                    // Case 2: Month DD, YYYY - description
                    } elseif (preg_match('/^([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*-\s*(.+)$/', $rawSummary, $matches)) {
                        $publishedAt = \Carbon\Carbon::parse($matches[1]); // Carbon can parse long dates
                        $description = $matches[2];
                    }
                }
    
                $news = News::firstOrCreate(
                    ['url' => $newsItem['link']],
                    [
                        'title' => $newsItem['title'] ?? null,
                        'description' => $description,
                        'source_id' => $source->source_id,
                        'published_at' => $publishedAt,
                    ]
                );
    
                $newsIds[] = $news->new_id; 
            }
    
            foreach ($userEmails as $email) {
                $user = User::where('email', $email)->first();
                if (!$user) continue;
    
                $mail = Email::create([
                    'recipient' => $user->user_id,
                    'subject' => $tagTitle,
                    'message' => 'Top News',
                    'status' => 'sent',
                ]);
    
                // Attach news to email pivot
                $mail->news()->attach($newsIds);
            }
    
            DB::commit();
    
            return [
                'success' => true,
                'news_count' => count($aiResponse),
                'emails_count' => count($userEmails)
            ];
    
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error storing news: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error storing news',
                'error' => $e->getMessage()
            ];
        }
    }


    public function getUserNews($userId)
    {
        try {
            $news = DB::table('news as n')
                ->join('emails_content as ec', 'ec.news_id', '=', 'n.new_id')
                ->join('emails as e', 'e.email_id', '=', 'ec.email_id')
                ->join('sources as s', 's.source_id', '=', 'n.source_id')
                ->join('users as u', 'u.user_id', '=', 'e.recipient')
                ->where('u.user_id', $userId)
                ->select(
                    'n.new_id as news_id', 'n.title as news_title',
                    'n.description as news_description',
                    'n.url as news_url',
                    'n.published_at as news_date',
                    's.source_domain as news_domain',
                    'e.subject as news_category'
                )
                ->groupBy(
                    'n.new_id', 'n.title',
                    'n.description',
                    'n.url',
                    'n.published_at',
                    's.source_domain',
                    'e.subject'
                )
                ->orderBy('n.published_at', 'desc') // optional: latest news first
                ->get();
    
            return response()->json([
                'news' => $news
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting user news',
                'error' => $e->getMessage()
            ]);
        }
    }
    
    
}

