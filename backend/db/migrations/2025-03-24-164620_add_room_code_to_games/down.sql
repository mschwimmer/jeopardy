-- This file should undo anything in `up.sql`
DROP INDEX unique_room_code;
ALTER TABLE games DROP COLUMN room_code;