# RuidMap 🗺️

Modern, ASCII-art inspired task management and roadmap desktop application built with Tauri, React, and Rust.

## 🌟 Features

- **Beautiful ASCII Art UI**: Retro-inspired interface with smooth animations
- **Cross-Platform Desktop App**: Built with Tauri for Windows, macOS, and Linux
- **Project & Workspace Management**: Multi-project support with project switching and filtering
- **Project Organization**: Color-coded projects with custom icons and settings
- **Kanban-Style Task Board**: Organize tasks in To Do, In Progress, and Done columns
- **Project-Specific Statistics**: Track progress and metrics per project
- **Multiple Themes**: Light, Dark, and Custom themes with real-time switching
- **Keyboard Shortcuts**: Efficient task management with keyboard controls
- **JSON Data Storage**: Simple, portable data storage with automatic migration
- **Framer Motion Animations**: Smooth transitions and delightful micro-interactions
- **TypeScript**: Full type safety for robust development

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Rust (latest stable)
- System dependencies for Tauri:
  - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft C++ Build Tools

### Installation

1. Clone the repository:
```bash
git clone https://github.com/reicalasso/ruidmap.git
cd ruidmap/ruidmap-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Start development mode:
```bash
npm run tauri dev
```

## 🔧 Development

### Project Structure

```
ruidmap-desktop/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main application
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands.rs    # Tauri command handlers
│   │   ├── models.rs      # Data models
│   │   ├── storage.rs     # JSON storage layer
│   │   └── lib.rs         # Main Tauri application
│   └── Cargo.toml
└── package.json
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run tauri dev` - Start Tauri development app
- `npm run tauri build` - Build production app
- `npm run build` - Build frontend for production

### Keyboard Shortcuts

- `Enter` - Add new task
- `Delete` - Delete selected task
- `Space` - Toggle task status
- `Ctrl/Cmd + T` - Switch theme
- `Escape` - Close modals

## 🎨 Themes

RuidMap comes with three built-in themes:

- **Light**: Clean, professional look for daytime use
- **Dark**: Easy on the eyes for extended usage
- **Custom**: Fully customizable color scheme

## 🏗️ Building for Production

### Desktop App

Build the desktop application:

```bash
npm run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`:
- **Linux**: `.deb`, `.appimage`
- **macOS**: `.dmg`, `.app`
- **Windows**: `.msi`, `.exe`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing framework
- [React](https://reactjs.org/) - For the powerful UI library
- [Framer Motion](https://www.framer.com/motion/) - For beautiful animations
- [Tailwind CSS](https://tailwindcss.com/) - For rapid styling

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/reicalasso/ruidmap/issues) on GitHub.

---

**Made with ❤️ by [reicalasso](https://github.com/reicalasso)**