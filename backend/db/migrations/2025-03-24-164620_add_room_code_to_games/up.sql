-- Your SQL goes here
ALTER TABLE games ADD COLUMN room_code TEXT;

UPDATE games SET room_code = 'TEMP'; -- Replace with real codes in practice

ALTER TABLE games ALTER COLUMN room_code SET NOT NULL;
