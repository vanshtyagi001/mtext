# Setup Instructions

## 1. Set Up Supabase
1. Create a new Supabase project
2. In the SQL Editor, run the following:

```sql
create table texts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  is_editable boolean default false not null
);

-- Turn on Row Level Security
alter table texts enable row level security;

-- Allow anonymous inserts (anyone can create a text)
create policy "Allow anonymous inserts" on texts for insert with check (true);

-- Allow public read of unexpired texts
create policy "Allow public read" on texts for select using (expires_at > now());

-- Allow public update of editable texts
create policy "Allow public update" on texts for update using (is_editable = true and expires_at > now());
```

3. Configure Supabase Realtime
- Go to Database > Publications, click on "insert" `supabase_realtime`. 
- Enable it for the `texts` table so the frontend can subscribe to live changes.

## 2. Environment Variables
Create a `.env.local` file with your project URLs:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Deployment
Connect this repo to Vercel and add the `.env.local` variables there.
