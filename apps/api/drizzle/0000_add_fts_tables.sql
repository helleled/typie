-- Drop existing regular FTS tables
DROP TABLE IF EXISTS posts_fts;
DROP TABLE IF EXISTS canvases_fts;

-- Add FTS5 virtual tables for full-text search

-- Posts FTS table
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  id UNINDEXED,
  site_id UNINDEXED,
  title,
  subtitle,
  text,
  content='',
  tokenize='unicode61'
);

-- Canvases FTS table
CREATE VIRTUAL TABLE IF NOT EXISTS canvases_fts USING fts5(
  id UNINDEXED,
  site_id UNINDEXED,
  title,
  content='',
  tokenize='unicode61'
);

-- Trigger to insert posts into FTS
CREATE TRIGGER IF NOT EXISTS posts_fts_insert AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(id, site_id, title, subtitle, text)
  SELECT 
    NEW.id,
    e.site_id,
    NEW.title,
    NEW.subtitle,
    pc.text
  FROM entities e
  LEFT JOIN post_contents pc ON pc.post_id = NEW.id
  WHERE e.id = NEW.entity_id AND e.state = 'ACTIVE';
END;

-- Trigger to update posts in FTS when post is updated
CREATE TRIGGER IF NOT EXISTS posts_fts_update_post AFTER UPDATE ON posts BEGIN
  DELETE FROM posts_fts WHERE id = OLD.id;
  INSERT INTO posts_fts(id, site_id, title, subtitle, text)
  SELECT 
    NEW.id,
    e.site_id,
    NEW.title,
    NEW.subtitle,
    pc.text
  FROM entities e
  LEFT JOIN post_contents pc ON pc.post_id = NEW.id
  WHERE e.id = NEW.entity_id AND e.state = 'ACTIVE';
END;

-- Trigger to update posts in FTS when post content is updated
CREATE TRIGGER IF NOT EXISTS posts_fts_update_content AFTER UPDATE ON post_contents BEGIN
  DELETE FROM posts_fts WHERE id = OLD.post_id;
  INSERT INTO posts_fts(id, site_id, title, subtitle, text)
  SELECT 
    p.id,
    e.site_id,
    p.title,
    p.subtitle,
    NEW.text
  FROM posts p
  INNER JOIN entities e ON p.entity_id = e.id
  WHERE p.id = NEW.post_id AND e.state = 'ACTIVE';
END;

-- Trigger to update posts in FTS when entity state changes
CREATE TRIGGER IF NOT EXISTS posts_fts_update_entity AFTER UPDATE ON entities BEGIN
  DELETE FROM posts_fts WHERE id IN (SELECT id FROM posts WHERE entity_id = NEW.id);
  INSERT INTO posts_fts(id, site_id, title, subtitle, text)
  SELECT 
    p.id,
    NEW.site_id,
    p.title,
    p.subtitle,
    pc.text
  FROM posts p
  LEFT JOIN post_contents pc ON pc.post_id = p.id
  WHERE p.entity_id = NEW.id AND NEW.state = 'ACTIVE';
END;

-- Trigger to delete posts from FTS
CREATE TRIGGER IF NOT EXISTS posts_fts_delete AFTER DELETE ON posts BEGIN
  DELETE FROM posts_fts WHERE id = OLD.id;
END;

-- Trigger to insert canvases into FTS
CREATE TRIGGER IF NOT EXISTS canvases_fts_insert AFTER INSERT ON canvases BEGIN
  INSERT INTO canvases_fts(id, site_id, title)
  SELECT 
    NEW.id,
    e.site_id,
    NEW.title
  FROM entities e
  WHERE e.id = NEW.entity_id AND e.state = 'ACTIVE';
END;

-- Trigger to update canvases in FTS when canvas is updated
CREATE TRIGGER IF NOT EXISTS canvases_fts_update AFTER UPDATE ON canvases BEGIN
  DELETE FROM canvases_fts WHERE id = OLD.id;
  INSERT INTO canvases_fts(id, site_id, title)
  SELECT 
    NEW.id,
    e.site_id,
    NEW.title
  FROM entities e
  WHERE e.id = NEW.entity_id AND e.state = 'ACTIVE';
END;

-- Trigger to update canvases in FTS when entity state changes
CREATE TRIGGER IF NOT EXISTS canvases_fts_update_entity AFTER UPDATE ON entities BEGIN
  DELETE FROM canvases_fts WHERE id IN (SELECT id FROM canvases WHERE entity_id = NEW.id);
  INSERT INTO canvases_fts(id, site_id, title)
  SELECT 
    c.id,
    NEW.site_id,
    c.title
  FROM canvases c
  WHERE c.entity_id = NEW.id AND NEW.state = 'ACTIVE';
END;

-- Trigger to delete canvases from FTS
CREATE TRIGGER IF NOT EXISTS canvases_fts_delete AFTER DELETE ON canvases BEGIN
  DELETE FROM canvases_fts WHERE id = OLD.id;
END;
