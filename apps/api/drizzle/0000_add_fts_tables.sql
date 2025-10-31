-- Create FTS5 virtual tables for full-text search
-- These tables are used by the search functionality to index posts and canvases

-- Create FTS table for posts
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
    id UNINDEXED,
    site_id UNINDEXED, 
    title,
    subtitle,
    text,
    content='posts_fts',
    content_rowid='rowid'
);

-- Create FTS table for canvases
CREATE VIRTUAL TABLE IF NOT EXISTS canvases_fts USING fts5(
    id UNINDEXED,
    site_id UNINDEXED,
    title,
    content='canvases_fts', 
    content_rowid='rowid'
);

-- Create triggers to automatically update FTS tables when posts are modified
-- Insert trigger for posts
CREATE TRIGGER IF NOT EXISTS posts_fts_insert AFTER INSERT ON posts_fts BEGIN
    INSERT INTO posts_fts(posts_fts) VALUES('rebuild');
END;

-- Update trigger for posts  
CREATE TRIGGER IF NOT EXISTS posts_fts_update AFTER UPDATE ON posts_fts BEGIN
    INSERT INTO posts_fts(posts_fts) VALUES('rebuild');
END;

-- Delete trigger for posts
CREATE TRIGGER IF NOT EXISTS posts_fts_delete AFTER DELETE ON posts_fts BEGIN
    INSERT INTO posts_fts(posts_fts) VALUES('rebuild');
END;

-- Insert trigger for canvases
CREATE TRIGGER IF NOT EXISTS canvases_fts_insert AFTER INSERT ON canvases_fts BEGIN
    INSERT INTO canvases_fts(canvases_fts) VALUES('rebuild');
END;

-- Update trigger for canvases
CREATE TRIGGER IF NOT EXISTS canvases_fts_update AFTER UPDATE ON canvases_fts BEGIN
    INSERT INTO canvases_fts(canvases_fts) VALUES('rebuild');
END;

-- Delete trigger for canvases
CREATE TRIGGER IF NOT EXISTS canvases_fts_delete AFTER DELETE ON canvases_fts BEGIN
    INSERT INTO canvases_fts(canvases_fts) VALUES('rebuild');
END;