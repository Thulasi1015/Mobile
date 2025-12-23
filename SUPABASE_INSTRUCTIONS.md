# How to Run SQL Commands in Supabase

Since you don't need to install any local database tools, you can run SQL commands directly from your browser.

## Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Sign in and click on your **School App** project.

## Step 2: Open SQL Editor
1. In the left-hand sidebar, look for the icon that looks like a terminal `>_` or lists "SQL Editor".
   *(It is usually the 3rd or 4th icon from the top).*
2. Click on it.

## Step 3: Run the Command
1. Click **+ New Query** (top left of the white pane) or select "Untitled Query".
2. Paste the SQL command you need to run. For example, to fix your profile error:
   ```sql
   ALTER TABLE public.profiles ADD COLUMN email TEXT;
   ```
3. Click the **RUN** button (bottom right of the text area, often green).

## Step 4: Verify
1. You should see a message saying "Success" or "No rows returned" (which is good for structure changes).
2. You can now go to the **Table Editor** (grid icon in sidebar) to check if the new column (`email`) appears in your `profiles` table.

---

### Need to reset everything?
If you want to start fresh (WARNING: DELETES ALL DATA), you can paste the entire content of your `supabase_schema.sql` file into the editor and run it.
