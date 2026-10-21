# News Emailer

An AI-powered news intelligence platform that automates research, filtering, translation, summarization, personalization, and email delivery.

## Overview

News Emailer began as an n8n workflow and evolved into a multi-user full-stack application. It was created to reduce the repetitive work involved in finding relevant news, validating results, preparing concise summaries, and distributing useful information to different recipients.

The system combines Google Programmable Search with Gemini-powered processing. Topics, tags, keywords, sources, users, and delivery preferences are managed through the application instead of being hard-coded into a single automation.

## Processing workflow

~~~mermaid
flowchart TD
    A[Topics, tags, and keywords] --> B[Query optimization]
    B --> C[Programmable web search]
    C --> D[Relevance and quality filtering]
    D --> E[Translation and summarization]
    E --> F[Deduplication and aggregation]
    F --> G[Personalized HTML digest]
    G --> H[Email delivery]
~~~

Each article, topic, and category can move through its processing stages independently. Completed results are then brought together for deduplication and recipient-specific delivery. This staged design makes the workflow easier to inspect, retry, and extend than one long synchronous process.

## Core capabilities

- Multi-user authentication and access through Laravel Sanctum
- User, tag, keyword, topic, source, and recipient management
- Subscription request approval and tag assignment workflows
- Search-query optimization and configurable prompt modules
- Retrieval through Google Programmable Search
- AI-assisted relevance filtering, verification, translation, and summarization
- Saved-news management
- Personalized digest assembly and HTML email delivery
- Queue-ready Laravel development workflow
- API endpoints for administration and processing operations

## Architecture

- **Backend:** PHP 8.2, Laravel 12, Laravel Sanctum
- **Frontend:** React 19, TypeScript, Inertia.js, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Database:** MySQL
- **AI:** Gemini API with stored, module-based prompts
- **Search:** Google Programmable Search
- **Automation:** Original n8n workflow, later redesigned as application services and processing stages
- **Delivery:** Laravel mail and HTML digest generation

Laravel controllers expose the user and processing APIs, while service classes isolate query construction, search behavior, AI requests, and workflow logic. Prompt modules are stored as application data so the processing behavior can evolve without placing every instruction directly in controller code.

## Local development

### Prerequisites

- PHP 8.2 or newer
- Composer
- Node.js and npm
- MySQL
- Credentials for the external search, AI, and email services used by the application

### Setup

~~~bash
git clone https://github.com/Patrick-beep-ui/Emails_Project.git
cd Emails_Project
composer install
npm install
php artisan key:generate
~~~

Create and configure a Laravel `.env` file with the application URL, MySQL connection, mail transport, and required external-service credentials. Then initialize the database:

~~~bash
php artisan migrate
~~~

Run the Laravel server, queue listener, logs, and Vite together:

~~~bash
composer run dev
~~~

## Testing

~~~bash
composer test
~~~

## Project context

The work covered the original automation, staged workflow design, data modeling, Laravel services and APIs, React interface, Gemini integration, prompt design, structured processing, exception handling, and the transition from an n8n proof of concept into a maintainable application.

## Responsible configuration

API keys, mail credentials, and production data must remain outside version control. Use environment variables and separate development credentials when running the project locally.

