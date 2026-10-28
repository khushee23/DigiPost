-- Reset the standard DigiPost demo administrator and employee credentials.
-- Run once in Supabase SQL Editor for an existing project.
-- Demo only; change these passwords before exposing the application publicly.

BEGIN;

UPDATE public.users
SET password = '$2b$10$mwvh093k2c1dGXcvCzYSKOr2WunfVPelUcM0JRMX6cPq9So5qaJpS',
    updated_at = now()
WHERE email = 'admin@postoffice.gov'
  AND role = 'admin';

UPDATE public.users
SET password = '$2b$10$fVJLYBiZst4af08lrcC6qOaeupUWP0SzLzvlqYz1zkMhGHRlTcMkq',
    updated_at = now()
WHERE email = 'employee@postoffice.gov'
  AND role = 'employee';

COMMIT;
