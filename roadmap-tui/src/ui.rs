use ratatui::{
    layout::Rect,
    style::{Color, Style},
};

pub fn get_app_title() -> String {
    r#"
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                      ║
║    ██████╗ ██╗   ██╗██╗██████╗ ███╗   ███╗ █████╗ ██████╗                          ║
║    ██╔══██╗██║   ██║██║██╔══██╗████╗ ████║██╔══██╗██╔══██╗                         ║
║    ██████╔╝██║   ██║██║██║  ██║██╔████╔██║███████║██████╔╝                         ║
║    ██╔══██╗██║   ██║██║██║  ██║██║╚██╔╝██║██╔══██║██╔═══╝                          ║
║    ██║  ██║╚██████╔╝██║██████╔╝██║ ╚═╝ ██║██║  ██║██║                              ║
║    ╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝                              ║
║                                                                                      ║
║                    🚀 Interactive Roadmap Manager 🚀                               ║
║                                                                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
"#.to_string()
}

pub fn get_compact_title() -> String {
    r#"
┌─────────────────────────────────────────────────────────────┐
│ 🚀 RUIDMAP - Interactive Roadmap Manager 🚀               │
└─────────────────────────────────────────────────────────────┘
"#.to_string()
}

pub fn get_minimal_title() -> String {
    "🚀 RUIDMAP 🚀".to_string()
}

pub fn get_responsive_title(area: Rect) -> String {
    if area.width >= 90 && area.height >= 15 {
        get_app_title()
    } else if area.width >= 65 && area.height >= 8 {
        get_compact_title()
    } else {
        get_minimal_title()
    }
}

pub fn get_help_text() -> Vec<&'static str> {
    vec![
        "🎯 RUIDMAP - Interactive Roadmap Manager",
        "",
        "📋 Navigation:",
        "  ↑/↓     - Navigate milestones",
        "  Enter   - View/Edit milestone details",
        "  Tab     - Switch between panels",
        "",
        "⚡ Actions:",
        "  'a'     - Add new milestone",
        "  'e'     - Edit selected milestone", 
        "  'd'     - Delete selected milestone",
        "  'c'     - Mark as completed",
        "  't'     - Change status (toggle)",
        "  'p'     - Change priority",
        "  'f'     - Create new folder",
        "  'o'     - Open/close folder",
        "",
        "💾 File Operations:",
        "  Ctrl+S  - Save roadmap",
        "  Ctrl+O  - Open roadmap",
        "  Ctrl+B  - Backup roadmap",
        "",
        "🎨 View:",
        "  'h'     - Toggle help",
        "  'r'     - Refresh view",
        "  'q'/'ESC' - Quit application",
        "",
        "🌟 Features:",
        "  • Real-time progress tracking",
        "  • Priority-based color coding", 
        "  • Auto-save functionality",
        "  • ASCII art visualization",
        "  • Folder organization",
        "",
    ]
}

pub fn get_compact_help_text() -> Vec<&'static str> {
    vec![
        "🎯 RUIDMAP Help",
        "",
        "Navigation: ↑/↓ move, Enter select",
        "Actions: a=add, e=edit, d=delete, c=complete",
        "Status: t=toggle, p=priority, f=folder",
        "File: Ctrl+S save, Ctrl+B backup",
        "View: h=help, r=refresh, q=quit",
        "",
    ]
}

pub fn create_progress_bar(percentage: f64, width: u16) -> String {
    let filled_width = ((percentage / 100.0) * width as f64) as u16;
    let empty_width = width - filled_width;
    
    format!(
        "{}{}",
        "█".repeat(filled_width as usize),
        "░".repeat(empty_width as usize)
    )
}

pub fn create_animated_progress_bar(percentage: f64, width: u16, frame: u8) -> String {
    let filled_width = ((percentage / 100.0) * width as f64) as u16;
    let empty_width = width - filled_width;
    
    // Animasyon için farklı karakterler kullan
    let fill_chars = ["█", "▉", "▊", "▋", "▌", "▍", "▎", "▏"];
    let current_fill = fill_chars[(frame % 8) as usize];
    
    if percentage < 100.0 && filled_width > 0 {
        format!(
            "{}{}{}",
            "█".repeat((filled_width - 1) as usize),
            current_fill,
            "░".repeat(empty_width as usize)
        )
    } else {
        format!(
            "{}{}",
            "█".repeat(filled_width as usize),
            "░".repeat(empty_width as usize)
        )
    }
}

pub fn create_milestone_card(title: &str, status: &str, priority: &str, progress: f64, area: Rect) -> String {
    if area.width < 60 {
        // Compact version for smaller screens
        format!(
            r#"
┌─────────────────────────────────────────────┐
│ 🎯 {:<35} │
│ {} {} {:>5.1}%                          │
└─────────────────────────────────────────────┘"#,
            if title.len() > 35 { 
                format!("{}...", &title[..32])
            } else { 
                title.to_string() 
            },
            status.chars().next().unwrap_or('?'),
            priority.chars().next().unwrap_or('?'),
            progress
        )
    } else {
        format!(
            r#"
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 {:<55} │
│ ────────────────────────────────────────────────────────────── │
│ Status: {:<10} │ Priority: {:<10} │ Progress: {:>5.1}% │
│ [{}] │
└─────────────────────────────────────────────────────────────────┘"#,
            if title.len() > 55 { 
                format!("{}...", &title[..52])
            } else { 
                title.to_string() 
            },
            status,
            priority,
            progress,
            create_progress_bar(progress, 55)
        )
    }
}

pub fn create_stats_panel(
    total: usize,
    completed: usize,
    in_progress: usize,
    pending: usize,
    blocked: usize,
    overall_progress: f64,
    area: Rect,
) -> String {
    if area.width < 60 {
        // Compact stats for smaller screens
        format!(
            r#"
┌─ 📊 STATS ──────────────────────────┐
│ Progress: {:>5.1}%                   │
│ [{}] │
│ Total: {} | Done: {} | Todo: {}    │
└─────────────────────────────────────┘"#,
            overall_progress,
            create_progress_bar(overall_progress, 30),
            total,
            completed,
            pending
        )
    } else {
        format!(
            r#"
┌─ 📊 PROGRESS OVERVIEW ─────────────────────────────────────────────┐
│                                                                   │
│  Overall Progress: {:<40} {:>5.1}%  │
│  [{}]  │
│                                                                   │
│  📈 Statistics:                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Total Milestones: {:<3}  │  ✅ Completed:   {:<3}        │ │
│  │  🔄 In Progress:   {:<3}  │  ⭕ Pending:     {:<3}        │ │
│  │  🚫 Blocked:       {:<3}  │                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘"#,
            "",
            overall_progress,
            create_progress_bar(overall_progress, 55),
            total,
            completed,
            in_progress,
            pending,
            blocked
        )
    }
}

pub fn create_ascii_celebration() -> String {
    r#"
        🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉
        
                   ⭐ ⭐ ⭐ ⭐ ⭐
                 🏆 MILESTONE COMPLETED! 🏆
                   ⭐ ⭐ ⭐ ⭐ ⭐
                   
              ╔═══════════════════════╗
              ║    KEEP UP THE       ║
              ║    GREAT WORK!       ║
              ╚═══════════════════════╝
                   
                    🚀 → 🌟 → 🏁
"#.to_string()
}

pub fn create_folder_tree_view(folders: &[(String, Vec<String>)], expanded: &[bool]) -> String {
    let mut tree = String::new();
    tree.push_str("📁 Folder Structure:\n");
    tree.push_str("├─────────────────────\n");
    
    for (i, (folder_name, items)) in folders.iter().enumerate() {
        let is_expanded = expanded.get(i).unwrap_or(&false);
        let folder_icon = if *is_expanded { "📂" } else { "📁" };
        
        tree.push_str(&format!("│ {} {}\n", folder_icon, folder_name));
        
        if *is_expanded {
            for (j, item) in items.iter().enumerate() {
                let connector = if j == items.len() - 1 { "└─" } else { "├─" };
                tree.push_str(&format!("│   {} 📄 {}\n", connector, item));
            }
        }
    }
    
    tree
}

pub fn create_loading_animation(frame: u8) -> String {
    let spinner_chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let current_char = spinner_chars[(frame % 10) as usize];
    format!("{} Loading...", current_char)
}

pub fn create_welcome_screen(area: Rect) -> String {
    if area.width < 60 {
        format!(
            r#"{}

{}

┌─ 🎯 GETTING STARTED ─────────────────┐
│ Welcome to RUIDMAP!                  │
│                                      │
│ 🚀 Quick Start:                      │
│   • Press 'a' to add milestone       │
│   • Use ↑/↓ to navigate             │
│   • Press 'h' for help              │
│                                      │
│ 💡 Pro Tips:                         │
│   • Set realistic goals              │
│   • Use priorities                   │
│   • Regular updates                  │
└──────────────────────────────────────┘"#,
            get_responsive_title(area),
            create_stats_panel(0, 0, 0, 0, 0, 0.0, area)
        )
    } else {
        format!(
            r#"{}

{}

┌─ 🎯 GETTING STARTED ─────────────────────────────────────────────────┐
│                                                                     │
│  Welcome to RUIDMAP! Your interactive roadmap manager.              │
│                                                                     │
│  🚀 Quick Start:                                                    │
│    • Press 'a' to add your first milestone                         │
│    • Use ↑/↓ to navigate through your roadmap                      │
│    • Press 'h' anytime for help                                    │
│                                                                     │
│  💡 Pro Tips:                                                       │
│    • Set realistic goals and deadlines                             │
│    • Use priorities to focus on what matters most                  │
│    • Regular updates keep you motivated                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘"#,
            get_responsive_title(area),
            create_stats_panel(0, 0, 0, 0, 0, 0.0, area)
        )
    }
}