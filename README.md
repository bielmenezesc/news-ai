# AI News Summarizer & Ranking Engine

This is a full-stack application that allows users to fetch news articles, generate AI-powered summaries with their own context, and view them in a list ranked by a dynamic quality score.

## Core Features

- **Article Fetching**: Fetches news articles from an external API.
- **AI Summarization**: Integrates with an n8n workflow that uses OpenAI to generate a concise summary based on the article's content and user-provided context and relevance score for that article.
- **Dynamic Sorting**: Articles are sorted and displayed based on a quality score derived from user engagement (`selection_count`), an AI-powered quality analysis (`ai_powered_score`), and recency.
- **CRUD-style List**: Users can view and delete their generated summaries.
- **Database Persistence**: All summaries and article relevance scores are stored in a Supabase database.

---

## Tech Stack

- **Frontend**: React (Next.js)
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Automation/AI**: n8n, OpenAI

---

## Project Setup

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- A Supabase account and a new project created.
- An n8n workflow deployed and ready to receive webhook triggers.

### 1. Clone the Repository

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Supabase Setup

1.  **Create Tables**: In the Supabase SQL Editor, run the following SQL to create the necessary tables.

    ```sql
    -- Table to store user-generated summaries
    CREATE TABLE summaries (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      article_id TEXT NOT NULL,
      article_title TEXT,
      summary TEXT,
      user_input TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Table to track article scores and engagement
    CREATE TABLE articles_relevance (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      article_id TEXT NOT NULL UNIQUE,
      selection_count INT NOT NULL DEFAULT 0,
      ai_powered_score NUMERIC,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

2.  **Create RPC Functions**: Run the following SQL to create the database functions needed for atomic updates.

    ```sql
    -- Increments the selection count when a user picks an article
    CREATE OR REPLACE FUNCTION upsert_selection_count(p_article_id TEXT)
    RETURNS void AS $$
    BEGIN
        INSERT INTO articles_relevance (article_id, selection_count)
        VALUES (p_article_id, 1)
        ON CONFLICT (article_id) DO UPDATE
        SET selection_count = articles_relevance.selection_count + 1;
    END;
    $$ LANGUAGE plpgsql;

    -- Updates the AI-powered score with a simple running average
    CREATE OR REPLACE FUNCTION update_ai_score(p_article_id TEXT, p_new_score NUMERIC)
    RETURNS void AS $$
    BEGIN
        INSERT INTO articles_relevance (article_id, ai_powered_score)
        VALUES (p_article_id, p_new_score)
        ON CONFLICT (article_id) DO UPDATE
        SET
            ai_powered_score =
                CASE
                    WHEN articles_relevance.ai_powered_score IS NULL
                    THEN p_new_score
                    ELSE (articles_relevance.ai_powered_score + p_new_score) / 2
                END;
    END;
    $$ LANGUAGE plpgsql;
    ```

### 3 n8n Setup

Configure your n8n workflow to:

1.  Accept a `POST` request with a JSON body containing `article` and `userInput`.
2.  Call the OpenAI API with a prompt to generate a summary and an `ai_powered_score` (from 0-10).
3.  Return a JSON object with the `summary` and `ai_powered_score`.

### 4 Environment Variables

Rename the file `.env.local.example` to `.env.local` in the root of the project and add your keys.

### 5 Install Dependencies & Run

```bash
npm install
npm run dev
```

The application should now be running on `http://localhost:3000`.

---

### Frontend (React/Next.js)

The frontend is responsible for user interaction. It calls an internal API route (`/api/articles`) to get a sorted list of articles and renders them. When a user creates a summary, it calls another API route to trigger the n8n workflow and save the results.

### Backend (API Route)

A server-side API route (`/api/articles`) acts as a mediator. It fetches raw article data from the external API and then fetches the corresponding scores from our Supabase database. It merges these two datasets and applies the sorting logic before sending a clean, ordered list to the frontend.

### Database (Supabase)

Supabase stores all persistent data.

- **`summaries` table**: Stores the final output generated for a user.
- **`articles_relevance` table**: A critical table that tracks engagement and quality metrics for each article, acting as the source of truth for our sorting algorithm.
- **RPC Functions**: Used to handle database updates atomically and securely, abstracting complex SQL logic away from the application code.

### Automation (n8n & OpenAI)

An n8n workflow orchestrates the AI logic. It receives data from our app, calls OpenAI to perform the analysis, and returns the structured result. This decouples the AI processing from our main application.

---

## Design Decisions & Tradeoffs

### Server-Side Sorting

- **Decision**: The logic for fetching, merging, and sorting articles is handled in a server-side API route rather than on the client.
- **Reasoning**: This approach is more performant and scalable. The client receives a pre-sorted list ready for display, reducing client-side processing and ensuring the sorting logic is centralized and consistent.
- **Tradeoff**: It introduces a slight overhead by requiring an extra network request (Client -\> Our API -\> External API) instead of a direct call from the client to the external API. However, the benefits of centralized logic and data enrichment far outweigh this.

### Database Functions (RPC) for Mutations

- **Decision**: All data mutations (like incrementing a count or updating a score) are handled by calling Supabase RPC functions.
- **Reasoning**: This is more secure and robust than building SQL queries on the client or server. It ensures operations are atomic (they either fully complete or not at all) and hides the database schema details from the application layer.
- **Tradeoff**: Requires writing and maintaining SQL functions, which can be less familiar to frontend-focused developers compared to using a client-side ORM.

### Score Averaging Method

- **Decision**: For the MVP, the `ai_powered_score` is updated using a simple average: `(old_score + new_score) / 2`.
- **Reasoning**: This method is extremely simple to implement and works with the existing database schema without requiring additional columns (like a `score_count`). It provides a good-enough smoothing effect for this exercise.
- **Tradeoff**: This is not a true mathematical running average. It gives a 50% weight to the most recent score, meaning it reacts quickly to new data but can be volatile. A more robust solution would track the count of scores to calculate a true weighted average, at the cost of slightly more complexity.
