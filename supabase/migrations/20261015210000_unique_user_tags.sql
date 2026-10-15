BEGIN;

WITH ranked_tags AS (
    SELECT
        id,
        FIRST_VALUE(id) OVER (
            PARTITION BY user_id, name
            ORDER BY created_at, id
        ) AS canonical_id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, name
            ORDER BY created_at, id
        ) AS duplicate_number
    FROM public.tags
)
UPDATE public.notes AS notes
SET tag_id = ranked_tags.canonical_id
FROM ranked_tags
WHERE notes.tag_id = ranked_tags.id
  AND ranked_tags.duplicate_number > 1;

WITH ranked_tags AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, name
            ORDER BY created_at, id
        ) AS duplicate_number
    FROM public.tags
)
DELETE FROM public.tags AS tags
USING ranked_tags
WHERE tags.id = ranked_tags.id
  AND ranked_tags.duplicate_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS tags_user_id_name_key
    ON public.tags (user_id, name);

COMMIT;
