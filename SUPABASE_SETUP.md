# 🚀 Supabase Integration Setup Guide

This guide will help you set up Supabase integration for your Ubuntu OS Simulator, enabling persistent file systems, user authentication, and real-time collaboration features.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Basic understanding of environment variables

## 🔧 Step 1: Create Supabase Project

1. **Sign up for Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create a free account
   - Click "New Project"

2. **Create a new project**
   - Choose your organization
   - Enter project name: `ubuntu-os-simulator`
   - Enter database password (save this!)
   - Select region closest to your users
   - Click "Create new project"

3. **Wait for setup**
   - Project creation takes 2-3 minutes
   - You'll see a dashboard when ready

## 🗄️ Step 2: Set Up Database Schema

1. **Open SQL Editor**
   - In your Supabase dashboard, click "SQL Editor"
   - Click "New query"

2. **Run the schema**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

3. **Verify tables**
   - Go to "Table Editor" in the sidebar
   - You should see these tables:
     - `users`
     - `file_system`
     - `terminal_sessions`
     - `user_settings`
     - `applications`
     - `user_applications`
     - `shared_workspaces`
     - `workspace_members`
     - `system_logs`
     - `packages`

## 🔐 Step 3: Configure Authentication

1. **Enable Email Authentication**
   - Go to "Authentication" → "Settings"
   - Under "Auth Providers", ensure "Email" is enabled
   - Set "Confirm email" to your preference (recommended: enabled)

2. **Configure OAuth Providers (Optional)**
   - Still in Authentication Settings
   - Enable Google OAuth:
     - Toggle "Google" to enabled
     - Add your Google OAuth credentials
   - Enable GitHub OAuth:
     - Toggle "GitHub" to enabled
     - Add your GitHub OAuth credentials

3. **Set up Email Templates (Optional)**
   - Go to "Authentication" → "Email Templates"
   - Customize confirmation and reset password emails

## 🔑 Step 4: Get API Keys

1. **Find your project credentials**
   - Go to "Settings" → "API"
   - Copy these values:
     - Project URL
     - `anon` public key
     - `service_role` secret key (optional, for admin operations)

## 🌍 Step 5: Configure Environment Variables

1. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your Supabase credentials**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Replace placeholder values**
   - Use the actual values from Step 4
   - Keep the `NEXT_PUBLIC_` prefix for client-side variables

## 🚀 Step 6: Start the Application

1. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Test the integration**
   - Open http://localhost:3000
   - You should see the Supabase-powered login screen
   - Try creating an account and logging in

## ✅ Step 7: Verify Features

### Authentication
- [ ] User registration works
- [ ] Email confirmation (if enabled)
- [ ] User login/logout
- [ ] OAuth providers (if configured)

### File System Persistence
- [ ] Create files and folders
- [ ] Files persist after logout/login
- [ ] User isolation (users can't see each other's files)
- [ ] Home directory auto-creation

### Terminal Persistence
- [ ] Command history saves between sessions
- [ ] Current directory persists
- [ ] Environment variables maintained

### Real-time Features
- [ ] File changes sync in real-time
- [ ] Multiple users can collaborate
- [ ] User presence indicators

## 🔧 Troubleshooting

### Common Issues

**"Invalid API key" error**
- Check your environment variables
- Ensure `.env.local` is in the project root
- Restart the development server after changing env vars

**Database connection errors**
- Verify your project URL is correct
- Check if your Supabase project is active
- Ensure the database schema was applied correctly

**Authentication not working**
- Check if email authentication is enabled in Supabase
- Verify your site URL in Supabase settings
- For OAuth: ensure redirect URLs are configured

**Files not persisting**
- Check browser console for errors
- Verify Row Level Security policies are applied
- Ensure user is properly authenticated

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

### Reset Database

If you need to start fresh:
1. Go to Supabase SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run the schema from `supabase/schema.sql`

## 🎯 Next Steps

Once everything is working:

1. **Customize the experience**
   - Modify user registration fields
   - Add custom applications
   - Configure workspace permissions

2. **Deploy to production**
   - Set up production Supabase project
   - Configure production environment variables
   - Set up proper domain and SSL

3. **Monitor usage**
   - Check Supabase dashboard for usage metrics
   - Monitor real-time connections
   - Review authentication logs

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Ubuntu OS Simulator GitHub](https://github.com/your-repo)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs in your dashboard
3. Check browser console for JavaScript errors
4. Open an issue on GitHub with error details

---

🎉 **Congratulations!** You now have a fully persistent, collaborative Ubuntu OS Simulator powered by Supabase!
