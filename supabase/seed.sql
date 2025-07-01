-- Seed data for Ubuntu OS Simulator
-- Run this after the main schema to populate initial data

-- Insert sample applications
INSERT INTO public.applications (name, version, description, package_name, metadata, dependencies) VALUES
('Terminal', '1.0.0', 'GNOME Terminal emulator with full bash support', 'gnome-terminal', 
 '{"icon": "terminal", "category": "System", "executable": "gnome-terminal"}', 
 '["bash", "coreutils"]'),

('Text Editor', '1.0.0', 'Simple text editor for creating and editing files', 'gedit',
 '{"icon": "edit", "category": "Accessories", "executable": "gedit"}',
 '["gtk3", "glib"]'),

('File Manager', '1.0.0', 'Browse and manage your files and folders', 'nautilus',
 '{"icon": "folder", "category": "System", "executable": "nautilus"}',
 '["gtk3", "gvfs"]'),

('Camera', '1.0.0', 'Take photos and record videos using your webcam', 'cheese',
 '{"icon": "camera", "category": "Graphics", "executable": "cheese"}',
 '["gstreamer", "gtk3"]'),

('Calculator', '1.0.0', 'Perform basic and scientific calculations', 'gnome-calculator',
 '{"icon": "calculator", "category": "Accessories", "executable": "gnome-calculator"}',
 '["gtk3", "glib"]'),

('Notes', '1.0.0', 'Quick note-taking application', 'gnome-notes',
 '{"icon": "sticky-note", "category": "Accessories", "executable": "bijiben"}',
 '["gtk3", "webkit2gtk"]'),

('Weather', '1.0.0', 'Check current weather conditions and forecasts', 'gnome-weather',
 '{"icon": "cloud-sun", "category": "Accessories", "executable": "gnome-weather"}',
 '["gtk3", "libgweather"]'),

('Clock', '1.0.0', 'World clock, alarms, and timers', 'gnome-clocks',
 '{"icon": "clock", "category": "Accessories", "executable": "gnome-clocks"}',
 '["gtk3", "libgeoclue"]'),

('System Monitor', '1.0.0', 'Monitor system resources and processes', 'gnome-system-monitor',
 '{"icon": "activity", "category": "System", "executable": "gnome-system-monitor"}',
 '["gtk3", "libgtop"]'),

('Settings', '1.0.0', 'Configure system settings and preferences', 'gnome-control-center',
 '{"icon": "settings", "category": "System", "executable": "gnome-control-center"}',
 '["gtk3", "accountsservice"]');

-- Insert sample packages (simulating Ubuntu repository)
INSERT INTO public.packages (name, version, description, category, size, dependencies, metadata) VALUES
-- Core system packages
('bash', '5.1.16-1ubuntu1', 'GNU Bourne Again SHell', 'shells', 1234567, '["libc6", "libtinfo6"]',
 '{"essential": true, "priority": "required"}'),

('coreutils', '8.32-4.1ubuntu1', 'GNU core utilities', 'utils', 2345678, '["libc6"]',
 '{"essential": true, "priority": "required"}'),

('grep', '3.7-1build1', 'GNU grep, egrep and fgrep', 'utils', 456789, '["libc6", "libpcre3"]',
 '{"essential": true, "priority": "required"}'),

('sed', '4.8-1ubuntu2', 'GNU stream editor for filtering and transforming text', 'utils', 345678, '["libc6"]',
 '{"essential": true, "priority": "required"}'),

('tar', '1.34+dfsg-1build3', 'GNU version of the tar archiving utility', 'utils', 567890, '["libc6"]',
 '{"essential": true, "priority": "required"}'),

-- Development tools
('gcc', '4:11.2.0-1ubuntu1', 'GNU C compiler', 'devel', 12345678, '["gcc-11", "libc6-dev"]',
 '{"section": "devel", "priority": "optional"}'),

('make', '4.3-4.1build1', 'GNU Make utility to maintain groups of programs', 'devel', 234567, '["libc6"]',
 '{"section": "devel", "priority": "optional"}'),

('git', '1:2.34.1-1ubuntu1.10', 'Fast, scalable, distributed revision control system', 'vcs', 3456789, '["libc6", "libcurl4", "libexpat1"]',
 '{"section": "vcs", "priority": "optional"}'),

('vim', '2:8.2.3458-2ubuntu2.4', 'Vi IMproved - enhanced vi editor', 'editors', 1234567, '["libc6", "libncurses6"]',
 '{"section": "editors", "priority": "optional"}'),

('nano', '6.2-1', 'Small, friendly text editor inspired by Pico', 'editors', 234567, '["libc6", "libncurses6"]',
 '{"section": "editors", "priority": "optional"}'),

-- Network tools
('curl', '7.81.0-1ubuntu1.15', 'Command line tool for transferring data with URL syntax', 'web', 456789, '["libc6", "libcurl4"]',
 '{"section": "web", "priority": "optional"}'),

('wget', '1.21.2-2ubuntu1', 'Retrieves files from the web', 'web', 345678, '["libc6", "libssl3"]',
 '{"section": "web", "priority": "optional"}'),

('openssh-client', '1:8.9p1-3ubuntu0.6', 'Secure shell (SSH) client, for secure access to remote machines', 'net', 567890, '["libc6", "libssl3"]',
 '{"section": "net", "priority": "standard"}'),

-- Media and graphics
('ffmpeg', '7:4.4.2-0ubuntu0.22.04.1', 'Tools for transcoding, streaming and playing of multimedia files', 'video', 23456789, '["libc6", "libavcodec58"]',
 '{"section": "video", "priority": "optional"}'),

('imagemagick', '8:6.9.11.60+dfsg-1.3ubuntu0.22.04.3', 'Image manipulation programs', 'graphics', 3456789, '["libc6", "libmagickcore-6.q16-6"]',
 '{"section": "graphics", "priority": "optional"}'),

('gimp', '2.10.30-1build1', 'GNU Image Manipulation Program', 'graphics', 45678901, '["libc6", "libgtk-3-0", "libgegl-0.4-0"]',
 '{"section": "graphics", "priority": "optional"}'),

-- System utilities
('htop', '3.0.5-7build2', 'Interactive processes viewer', 'utils', 123456, '["libc6", "libncurses6"]',
 '{"section": "utils", "priority": "optional"}'),

('tree', '2.0.2-1', 'Displays an indented directory tree, in color', 'utils', 67890, '["libc6"]',
 '{"section": "utils", "priority": "optional"}'),

('zip', '3.0-12build2', 'Archiver for .zip files', 'utils', 234567, '["libc6"]',
 '{"section": "utils", "priority": "optional"}'),

('unzip', '6.0-26ubuntu3.1', 'De-archiver for .zip files', 'utils', 123456, '["libc6"]',
 '{"section": "utils", "priority": "optional"}'),

-- Programming languages
('python3', '3.10.6-1~22.04', 'Interactive high-level object-oriented language', 'python', 4567890, '["libc6", "libpython3.10"]',
 '{"section": "python", "priority": "optional"}'),

('nodejs', '12.22.9~dfsg-1ubuntu3.4', 'Evented I/O for V8 javascript', 'javascript', 12345678, '["libc6", "libssl3"]',
 '{"section": "javascript", "priority": "optional"}'),

('ruby', '1:3.0~exp1', 'Interpreter of object-oriented scripting language Ruby', 'ruby', 2345678, '["libc6", "libruby3.0"]',
 '{"section": "ruby", "priority": "optional"}'),

-- Libraries
('libc6', '2.35-0ubuntu3.6', 'GNU C Library: Shared libraries', 'libs', 3456789, '[]',
 '{"essential": true, "priority": "required"}'),

('libssl3', '3.0.2-0ubuntu1.15', 'Secure Sockets Layer toolkit - shared libraries', 'libs', 1234567, '["libc6"]',
 '{"section": "libs", "priority": "standard"}'),

('libncurses6', '6.3-2ubuntu0.1', 'Shared libraries for terminal handling', 'libs', 345678, '["libc6"]',
 '{"section": "libs", "priority": "required"}'),

('libgtk-3-0', '3.24.33-1ubuntu2.1', 'GTK graphical user interface library', 'libs', 4567890, '["libc6", "libglib2.0-0"]',
 '{"section": "libs", "priority": "optional"}');

-- Create some sample shared workspaces (these will be created by users, but we can add some public ones)
-- Note: We can't insert into shared_workspaces without real user IDs, so this is commented out
-- Users will create their own workspaces through the UI

-- Insert some system-wide settings templates
-- These could be used as defaults for new users
-- Note: user_settings are user-specific, so these would be applied during user creation

-- Create a function to set up default applications for new users
CREATE OR REPLACE FUNCTION setup_default_applications_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Install default applications for new users
    INSERT INTO public.user_applications (user_id, application_id, is_installed, settings)
    SELECT 
        user_id,
        a.id,
        true,
        '{}'::jsonb
    FROM public.applications a
    WHERE a.name IN ('Terminal', 'Text Editor', 'File Manager', 'Calculator', 'Notes');
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to include default applications
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, full_name, home_directory)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        '/home/' || COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    -- Initialize user home directory
    PERFORM initialize_user_home(
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    -- Create default terminal session
    INSERT INTO public.terminal_sessions (user_id, session_name, current_directory)
    VALUES (
        NEW.id,
        'main',
        '/home/' || COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    -- Set up default applications
    PERFORM setup_default_applications_for_user(NEW.id);
    
    -- Add default user settings
    INSERT INTO public.user_settings (user_id, category, key, value) VALUES
        (NEW.id, 'wallpaper', 'type', '"gradient"'),
        (NEW.id, 'wallpaper', 'gradient', '{"from": "#f97316", "to": "#dc2626"}'),
        (NEW.id, 'desktop', 'theme', '"ubuntu"'),
        (NEW.id, 'terminal', 'shell', '"/bin/bash"'),
        (NEW.id, 'terminal', 'font_size', '14'),
        (NEW.id, 'system', 'timezone', '"UTC"');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
