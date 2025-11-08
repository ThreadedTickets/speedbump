CREATE TABLE IF NOT EXISTS guild (
  id TEXT PRIMARY KEY,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  deactivated DATE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS channel (
  id TEXT PRIMARY KEY,
  guild TEXT NOT NULL REFERENCES guild(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS slowmode_rule (
  id SERIAL PRIMARY KEY,
  channel TEXT NOT NULL REFERENCES channel(id) ON DELETE CASCADE,
  messages INTEGER CHECK (messages > 0),
  slowmode INTEGER CHECK (slowmode >= 0),
  interval INTEGER CHECK (interval > 0),
  notify BOOLEAN DEFAULT TRUE
);

CREATE OR REPLACE FUNCTION ensure_guild_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- If the guild doesn't exist, insert it
  IF NOT EXISTS (SELECT 1 FROM guild WHERE id = NEW.guild) THEN
    INSERT INTO guild (id, active, deactivated)
    VALUES (NEW.guild, TRUE, NULL);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER auto_insert_guild
BEFORE INSERT ON channel
FOR EACH ROW
EXECUTE FUNCTION ensure_guild_exists();
