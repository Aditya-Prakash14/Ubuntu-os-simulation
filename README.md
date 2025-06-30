# Ubuntu OS Simulator 🖥️

A comprehensive, web-based Ubuntu desktop environment simulator built with modern web technologies. Experience the full Ubuntu desktop experience directly in your browser with authentic applications, terminal functionality, and beautiful UI design.

![Ubuntu OS Simulator](https://img.shields.io/badge/Ubuntu-OS%20Simulator-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

## 🌟 Project Overview

The Ubuntu OS Simulator is a feature-rich web application that recreates the Ubuntu desktop experience with pixel-perfect accuracy. Built as a Progressive Web App (PWA), it provides users with a familiar Linux environment including a functional terminal, code editor, file system, and multiple desktop applications - all running seamlessly in the browser.

### 🎯 Purpose

- **Educational**: Learn Linux commands and Ubuntu interface without installation
- **Demonstration**: Showcase Ubuntu features to new users
- **Development**: Provide a sandboxed environment for testing and experimentation
- **Accessibility**: Access Ubuntu-like environment from any device with a web browser

## ✨ Features

### 🔐 Advanced Authentication System
- **Apple-inspired UI** with glass morphism design and smooth animations
- **Multi-step registration** with comprehensive user data collection
- **Real-time form validation** with visual feedback
- **Welcome animation sequence** with personalized greetings
- **Security features** including account lockout and password strength requirements
- **Demo account** for quick access (`demo` / `demo123`)

### 💻 Real Terminal Experience
- **xterm.js integration** for authentic terminal emulation
- **Unix command support**: `ls`, `cd`, `pwd`, `cat`, `echo`, `whoami`, `date`, `clear`, `help`
- **Command history** with arrow key navigation
- **Colored output** with proper Ubuntu terminal styling
- **Virtual file system** with realistic directory structure

### 📝 VS Code Editor
- **Monaco Editor** (the same engine powering VS Code)
- **Syntax highlighting** for multiple languages (JavaScript, TypeScript, Markdown, JSON, etc.)
- **File explorer** with folder navigation and file icons
- **Tab management** for multiple open files
- **Auto-save functionality** with real-time file system sync
- **IntelliSense** and code completion features

### 🎨 Advanced Wallpaper System
- **Multiple wallpaper types**: Gradients, patterns, and dynamic backgrounds
- **Time-based dynamic wallpapers** that change based on time of day
- **Live preview** and instant application
- **Category filtering** (All, Gradients, Patterns, Dynamic)
- **Custom wallpaper management** interface

### 🗂️ Integrated File System
- **Shared virtual file system** between terminal and editor
- **Real-time synchronization** - changes in editor visible in terminal
- **File operations** - create, read, update files
- **Realistic directory structure** with user home directory
- **Cross-application compatibility**

### 🖥️ Desktop Environment
- **Window management** with drag, resize, minimize, maximize, and close
- **Application dock** with hover effects and animations
- **System tray** with time, notifications, and system controls
- **Global search** functionality
- **Desktop widgets** (weather, system monitor)
- **Notification system** with toast messages

### 📱 Built-in Applications
- **Calculator**: Fully functional with basic and scientific operations
- **Calendar**: Interactive calendar with event management
- **Music Player**: Media player with playlist support
- **Photos**: Image gallery with grid and slideshow views
- **File Manager**: File browser with folder navigation
- **System Monitor**: Real-time system performance metrics
- **Settings**: Comprehensive system configuration panels
- **Text Editor**: Basic text editing capabilities

### 🎭 UI/UX Features
- **Responsive design** optimized for desktop and mobile
- **Smooth animations** powered by Framer Motion
- **Theme support** (Light, Dark, Auto)
- **Accessibility features** with proper ARIA labels
- **Touch-friendly** interface for mobile devices

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 15.2.4** - React framework with SSR and app router
- **React 19** - Component-based UI library
- **TypeScript** - Type-safe JavaScript development

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library for smooth transitions
- **Lucide React** - Beautiful icon library

### Terminal & Editor
- **@xterm/xterm** - Terminal emulator for the web
- **@monaco-editor/react** - VS Code editor component
- **React Context API** - State management for file system and auth

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Installation

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/ubuntu-os-simulator.git
cd ubuntu-os-simulator
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```
*Note: The `--legacy-peer-deps` flag is required due to peer dependency conflicts between some packages.*

3. **Start the development server**
```bash
npm run dev
```

4. **Access the application**
Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📖 Usage Guide

### Getting Started

1. **Authentication**
   - Use demo credentials: Username `demo`, Password `demo123`
   - Or create a new account through the multi-step registration process

2. **Welcome Animation**
   - Enjoy the Apple-inspired welcome sequence
   - Personalized greetings and setup process

3. **Desktop Navigation**
   - Click the Ubuntu logo (bottom-left) to open the application menu
   - Use the dock at the bottom to launch applications
   - Right-click for context menus (where available)

### Terminal Usage

Access the terminal from the dock and use these commands:

```bash
# Navigation
ls                    # List directory contents
cd [directory]        # Change directory
pwd                   # Print working directory
cd ..                 # Go to parent directory

# File operations
cat [filename]        # Display file contents
echo "text"          # Display text

# System information
whoami               # Display current user
date                 # Display current date and time

# Utility
clear                # Clear terminal screen
help                 # Show available commands
```

### Code Editor Workflow

1. **Open VS Code** from the dock
2. **Browse files** using the file explorer on the left
3. **Open files** by clicking on them
4. **Edit content** with full syntax highlighting
5. **Auto-save** - changes are automatically saved
6. **Switch between files** using tabs
7. **View changes** in terminal using `cat filename`

### Wallpaper Customization

1. **Open Settings** from the dock
2. **Navigate to Wallpaper** section
3. **Browse categories** (All, Gradients, Patterns, Dynamic)
4. **Click any wallpaper** to apply instantly
5. **Enable Dynamic Mode** for time-based wallpapers

### Application Features

- **Calculator**: Perform mathematical calculations
- **Calendar**: View and manage events
- **Music Player**: Play audio files and manage playlists
- **Photos**: View images in gallery or slideshow mode
- **File Manager**: Navigate and organize files
- **System Monitor**: Monitor system performance

## 📁 Project Structure

```
ubuntu-os-simulator/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── AuthScreen.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── WelcomeAnimation.tsx
│   ├── ui/               # UI components (Radix UI)
│   ├── XTerminal.tsx     # Terminal component
│   ├── VSCodeEditor.tsx  # Code editor component
│   └── WallpaperSettings.tsx
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   ├── FileSystemContext.tsx # File system state
│   └── WallpaperContext.tsx  # Wallpaper state
├── desktop.tsx           # Main desktop component
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## 🤝 Contributing

We welcome contributions to the Ubuntu OS Simulator! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add TypeScript types for new components
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design compatibility

### Areas for Contribution
- **New Applications**: Add more desktop applications
- **Terminal Commands**: Implement additional Unix commands
- **UI Improvements**: Enhance existing interfaces
- **Performance**: Optimize loading and rendering
- **Accessibility**: Improve screen reader support
- **Mobile Experience**: Enhance touch interactions

## 🐛 Troubleshooting

### Common Issues

**Installation Problems**
```bash
# If you encounter peer dependency issues
npm install --legacy-peer-deps --force

# Clear npm cache if needed
npm cache clean --force
```

**Development Server Issues**
```bash
# If the server won't start
rm -rf .next
npm run dev

# If you see module resolution errors
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Browser Compatibility**
- Ensure you're using a modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Enable JavaScript if disabled
- Clear browser cache and cookies

**Performance Issues**
- Close unused browser tabs
- Disable browser extensions that might interfere
- Use Chrome DevTools to identify performance bottlenecks

### Getting Help
- Check the [Issues](https://github.com/your-username/ubuntu-os-simulator/issues) page
- Create a new issue with detailed description and steps to reproduce
- Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ubuntu** - For the inspiration and design language
- **xterm.js** - For the excellent terminal emulation
- **Monaco Editor** - For the powerful code editing experience
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Radix UI** - For accessible component primitives

## 🌐 Demo & Screenshots

🔗 **Live Demo**: [Ubuntu OS Simulator](https://your-demo-url.com)

### Screenshots

*Authentication Screen*
![Auth Screen](screenshots/auth-screen.png)

*Desktop Environment*
![Desktop](screenshots/desktop.png)

*Terminal in Action*
![Terminal](screenshots/terminal.png)

*VS Code Editor*
![VS Code](screenshots/vscode.png)

---

**Built with ❤️ by [Your Name](https://github.com/your-username)**

⭐ Star this repository if you found it helpful!
