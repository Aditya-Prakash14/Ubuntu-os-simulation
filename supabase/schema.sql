-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    home_directory TEXT NOT NULL,
    shell TEXT DEFAULT '/bin/bash',
    uid INTEGER DEFAULT 1000,
    gid INTEGER DEFAULT 1000
);

-- Create file_system table
CREATE TABLE public.file_system (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('file', 'directory', 'symlink')),
    content TEXT DEFAULT '',
    metadata JSONB DEFAULT '{}',
    permissions TEXT DEFAULT '644',
    owner_uid INTEGER DEFAULT 1000,
    group_gid INTEGER DEFAULT 1000,
    size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES public.file_system(id) ON DELETE CASCADE,
    UNIQUE(user_id, path)
);

-- Create terminal_sessions table
CREATE TABLE public.terminal_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_name TEXT DEFAULT 'main',
    current_directory TEXT DEFAULT '/home/user',
    environment_vars JSONB DEFAULT '{}',
    command_history TEXT DEFAULT '',
    session_state JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, key)
);

-- Create applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_installed BOOLEAN DEFAULT false,
    package_name TEXT UNIQUE NOT NULL,
    dependencies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_applications table
CREATE TABLE public.user_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    is_installed BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    window_state JSONB DEFAULT '{}',
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, application_id)
);

-- Create shared_workspaces table
CREATE TABLE public.shared_workspaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES public.shared_workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Create system_logs table
CREATE TABLE public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    log_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'debug')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packages table
CREATE TABLE public.packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    category TEXT NOT NULL,
    dependencies JSONB DEFAULT '[]',
    size BIGINT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_file_system_user_path ON public.file_system(user_id, path);
CREATE INDEX idx_file_system_parent ON public.file_system(parent_id);
CREATE INDEX idx_terminal_sessions_user ON public.terminal_sessions(user_id);
CREATE INDEX idx_user_settings_user_category ON public.user_settings(user_id, category);
CREATE INDEX idx_user_applications_user ON public.user_applications(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_system_logs_user_type ON public.system_logs(user_id, log_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_file_system_modified_at BEFORE UPDATE ON public.file_system
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

-- Create function to initialize user home directory
CREATE OR REPLACE FUNCTION initialize_user_home(user_id UUID, username TEXT)
RETURNS VOID AS $$
DECLARE
    home_path TEXT := '/home/' || username;
BEGIN
    -- Create home directory
    INSERT INTO public.file_system (user_id, path, name, type, permissions, owner_uid, group_gid)
    VALUES (user_id, home_path, username, 'directory', '755', 1000, 1000);
    
    -- Create common directories
    INSERT INTO public.file_system (user_id, path, name, type, permissions, owner_uid, group_gid)
    VALUES 
        (user_id, home_path || '/Desktop', 'Desktop', 'directory', '755', 1000, 1000),
        (user_id, home_path || '/Documents', 'Documents', 'directory', '755', 1000, 1000),
        (user_id, home_path || '/Downloads', 'Downloads', 'directory', '755', 1000, 1000),
        (user_id, home_path || '/Pictures', 'Pictures', 'directory', '755', 1000, 1000),
        (user_id, home_path || '/Pictures/Camera', 'Camera', 'directory', '755', 1000, 1000),
        (user_id, home_path || '/Music', 'Music', 'directory', '755', 1000, 1000),
        (user_id, home_path || '/Videos', 'Videos', 'directory', '755', 1000, 1000);
    
    -- Create initial files
    INSERT INTO public.file_system (user_id, path, name, type, content, permissions, owner_uid, group_gid, size)
    VALUES 
        (user_id, home_path || '/.bashrc', '.bashrc', 'file', 
         '# ~/.bashrc: executed by bash(1) for non-login shells.
# Ubuntu OS Simulator - User Configuration

export PS1="\u@ubuntu-sim:\w$ "
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

# Aliases
alias ll="ls -alF"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."

# Welcome message
echo "Welcome to Ubuntu OS Simulator!"
echo "Type ''help'' for available commands."
', '644', 1000, 1000, 500),
        (user_id, home_path || '/README.txt', 'README.txt', 'file',
         'Welcome to your Ubuntu OS Simulator!

This is your personal home directory. You can:
- Create and edit files using the text editor
- Take photos with the camera app
- Customize your desktop wallpaper
- Use the terminal for command-line operations
- Install and manage applications

Your files are automatically saved and will persist between sessions.

Enjoy exploring your virtual Ubuntu environment!
', '644', 1000, 1000, 400);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for file_system table
CREATE POLICY "Users can manage own files" ON public.file_system
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for terminal_sessions table
CREATE POLICY "Users can manage own terminal sessions" ON public.terminal_sessions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_settings table
CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_applications table
CREATE POLICY "Users can manage own applications" ON public.user_applications
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for shared_workspaces table
CREATE POLICY "Users can view public workspaces" ON public.shared_workspaces
    FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can manage own workspaces" ON public.shared_workspaces
    FOR ALL USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members table
CREATE POLICY "Workspace members can view membership" ON public.workspace_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT owner_id FROM public.shared_workspaces
            WHERE id = workspace_id
        )
    );

CREATE POLICY "Workspace owners can manage members" ON public.workspace_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.shared_workspaces
            WHERE id = workspace_id
        )
    );

-- RLS Policies for system_logs table
CREATE POLICY "Users can view own logs" ON public.system_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own logs" ON public.system_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for applications and packages
CREATE POLICY "Anyone can view applications" ON public.applications
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view packages" ON public.packages
    FOR SELECT USING (true);

-- Create function to handle new user registration
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
