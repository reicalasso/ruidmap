use crate::models::{Folder, Milestone, Priority, Roadmap, Status};
use crate::storage::Storage;
use crate::ui;
use crossterm::event::{self, Event, KeyCode, KeyEvent, KeyModifiers, MouseEvent, MouseEventKind, MouseButton};
use ratatui::{
    prelude::*,
    widgets::{Block, Borders, Clear, List, ListItem, ListState, Paragraph, Wrap},
};
use std::error::Error;
use std::time::{Duration, Instant};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub enum AppMode {
    Normal,
    Help,
    AddMilestone,
    EditMilestone(Uuid),
    ConfirmDelete(Uuid),
    AddFolder,
    EditFolder(Uuid),
    SelectFolder(Uuid), // For assigning milestone to folder
}

#[derive(Debug, Clone)]
pub enum ViewMode {
    List,
    Tree,
    Kanban,
}

pub struct App {
    pub roadmap: Roadmap,
    pub storage: Storage,
    pub mode: AppMode,
    pub view_mode: ViewMode,
    pub milestone_list_state: ListState,
    pub folder_list_state: ListState,
    pub show_help: bool,
    pub input_buffer: String,
    pub selected_milestone: Option<Uuid>,
    pub selected_folder: Option<Uuid>,
    pub quit: bool,
    pub messages: Vec<String>,
    pub animation_frame: u8,
    pub last_frame_time: Instant,
    pub show_celebration: bool,
    pub celebration_start: Option<Instant>,
    // Mouse support
    pub milestone_list_area: Rect,
    pub folder_list_area: Rect,
    pub help_button_area: Rect,
    pub add_button_area: Rect,
    pub folder_button_area: Rect,
    pub mouse_hover_item: Option<usize>,
}

impl App {
    pub fn new(storage_path: String) -> Result<Self, Box<dyn Error>> {
        let storage = Storage::new(storage_path);
        let roadmap = storage.load_roadmap()?;
        
        let mut milestone_list_state = ListState::default();
        if !roadmap.milestones.is_empty() {
            milestone_list_state.select(Some(0));
        }

        let mut folder_list_state = ListState::default();
        if !roadmap.folders.is_empty() {
            folder_list_state.select(Some(0));
        }

        Ok(Self {
            roadmap,
            storage,
            mode: AppMode::Normal,
            view_mode: ViewMode::Tree,
            milestone_list_state,
            folder_list_state,
            show_help: false,
            input_buffer: String::new(),
            selected_milestone: None,
            selected_folder: None,
            quit: false,
            messages: Vec::new(),
            animation_frame: 0,
            last_frame_time: Instant::now(),
            show_celebration: false,
            celebration_start: None,
            // Initialize mouse areas with default empty rects
            milestone_list_area: Rect::default(),
            folder_list_area: Rect::default(),
            help_button_area: Rect::default(),
            add_button_area: Rect::default(),
            folder_button_area: Rect::default(),
            mouse_hover_item: None,
        })
    }

    pub fn run<B: Backend>(&mut self, terminal: &mut Terminal<B>) -> Result<(), Box<dyn Error>> {
        while !self.quit {
            terminal.draw(|f| self.draw(f))?;
            self.handle_events()?;
        }
        Ok(())
    }

    pub fn handle_events(&mut self) -> Result<(), Box<dyn Error>> {
        let event = event::read()?;
        match event {
            Event::Key(key) => {
                match self.mode {
                    AppMode::Normal => self.handle_normal_mode(key)?,
                    AppMode::Help => self.handle_help_mode(key),
                    AppMode::AddMilestone => self.handle_add_milestone_mode(key)?,
                    AppMode::EditMilestone(id) => self.handle_edit_milestone_mode(key, id)?,
                    AppMode::ConfirmDelete(id) => self.handle_confirm_delete_mode(key, id)?,
                    AppMode::AddFolder => self.handle_add_folder_mode(key)?,
                    AppMode::EditFolder(id) => self.handle_edit_folder_mode(key, id)?,
                    AppMode::SelectFolder(milestone_id) => self.handle_select_folder_mode(key, milestone_id)?,
                }
            }
            Event::Mouse(mouse_event) => {
                self.handle_mouse_event(mouse_event)?;
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_mouse_event(&mut self, mouse_event: MouseEvent) -> Result<(), Box<dyn Error>> {
        match mouse_event.kind {
            MouseEventKind::Down(MouseButton::Left) => {
                let x = mouse_event.column;
                let y = mouse_event.row;

                // Check if click is in milestone list area
                if self.milestone_list_area.x <= x && x < self.milestone_list_area.x + self.milestone_list_area.width
                    && self.milestone_list_area.y <= y && y < self.milestone_list_area.y + self.milestone_list_area.height {
                    
                    // Calculate which milestone was clicked
                    let relative_y = y - self.milestone_list_area.y;
                    let milestone_index = relative_y.saturating_sub(1) as usize; // Subtract 1 for border
                    
                    if milestone_index < self.roadmap.milestones.len() {
                        self.milestone_list_state.select(Some(milestone_index));
                    }
                }

                // Check if click is in folder list area
                else if self.folder_list_area.x <= x && x < self.folder_list_area.x + self.folder_list_area.width
                    && self.folder_list_area.y <= y && y < self.folder_list_area.y + self.folder_list_area.height {
                    
                    let relative_y = y - self.folder_list_area.y;
                    let folder_index = relative_y.saturating_sub(1) as usize;
                    
                    if folder_index < self.roadmap.folders.len() {
                        self.folder_list_state.select(Some(folder_index));
                    }
                }

                // Check if click is on help button
                else if self.help_button_area.x <= x && x < self.help_button_area.x + self.help_button_area.width
                    && self.help_button_area.y <= y && y < self.help_button_area.y + self.help_button_area.height {
                    
                    self.show_help = !self.show_help;
                    self.mode = if self.show_help { AppMode::Help } else { AppMode::Normal };
                }

                // Check if click is on add button
                else if self.add_button_area.x <= x && x < self.add_button_area.x + self.add_button_area.width
                    && self.add_button_area.y <= y && y < self.add_button_area.y + self.add_button_area.height {
                    
                    self.mode = AppMode::AddMilestone;
                    self.input_buffer.clear();
                }

                // Check if click is on folder button
                else if self.folder_button_area.x <= x && x < self.folder_button_area.x + self.folder_button_area.width
                    && self.folder_button_area.y <= y && y < self.folder_button_area.y + self.folder_button_area.height {
                    
                    self.mode = AppMode::AddFolder;
                    self.input_buffer.clear();
                }
            }
            MouseEventKind::Moved => {
                let x = mouse_event.column;
                let y = mouse_event.row;

                // Update hover state for milestone list
                if self.milestone_list_area.x <= x && x < self.milestone_list_area.x + self.milestone_list_area.width
                    && self.milestone_list_area.y <= y && y < self.milestone_list_area.y + self.milestone_list_area.height {
                    
                    let relative_y = y - self.milestone_list_area.y;
                    let milestone_index = relative_y.saturating_sub(1) as usize;
                    
                    if milestone_index < self.roadmap.milestones.len() {
                        self.mouse_hover_item = Some(milestone_index);
                    } else {
                        self.mouse_hover_item = None;
                    }
                } else {
                    self.mouse_hover_item = None;
                }
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_normal_mode(&mut self, key: KeyEvent) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Char('q') | KeyCode::Esc => {
                self.quit = true;
            }
            KeyCode::Char('h') => {
                self.show_help = !self.show_help;
                self.mode = if self.show_help { AppMode::Help } else { AppMode::Normal };
            }
            KeyCode::Char('a') => {
                self.mode = AppMode::AddMilestone;
                self.input_buffer.clear();
            }
            KeyCode::Char('e') => {
                if let Some(selected) = self.milestone_list_state.selected() {
                    if let Some(milestone) = self.roadmap.milestones.get(selected) {
                        self.mode = AppMode::EditMilestone(milestone.id);
                        self.input_buffer = milestone.title.clone();
                    }
                }
            }
            KeyCode::Char('d') => {
                if let Some(selected) = self.milestone_list_state.selected() {
                    if let Some(milestone) = self.roadmap.milestones.get(selected) {
                        self.mode = AppMode::ConfirmDelete(milestone.id);
                    }
                }
            }
            KeyCode::Char('c') => {
                if let Some(selected) = self.milestone_list_state.selected() {
                    if let Some(milestone) = self.roadmap.milestones.get_mut(selected) {
                        milestone.mark_completed();
                        self.add_message("🎉 Milestone marked as completed!");
                        self.save_roadmap()?;
                    }
                }
            }
            KeyCode::Char('s') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                self.save_roadmap()?;
                self.add_message("💾 Roadmap saved successfully!");
            }
            KeyCode::Char('t') => {
                self.cycle_status();
                self.save_roadmap()?;
            }
            KeyCode::Char('p') => {
                self.cycle_priority();
                self.save_roadmap()?;
            }
            KeyCode::Up => {
                self.move_selection_up();
            }
            KeyCode::Down => {
                self.move_selection_down();
            }
            KeyCode::Char('s') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                self.save_roadmap()?;
                self.add_message("💾 Roadmap saved successfully!");
            }
            KeyCode::Char('b') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                self.storage.backup_roadmap()?;
                self.add_message("🔄 Backup created successfully!");
            }
            KeyCode::Char('r') => {
                self.roadmap = self.storage.load_roadmap()?;
                self.add_message("🔄 Roadmap refreshed from disk!");
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_help_mode(&mut self, key: KeyEvent) {
        match key.code {
            KeyCode::Char('h') | KeyCode::Esc | KeyCode::Char('q') => {
                self.show_help = false;
                self.mode = AppMode::Normal;
            }
            _ => {}
        }
    }

    fn handle_add_milestone_mode(&mut self, key: KeyEvent) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Enter => {
                if !self.input_buffer.trim().is_empty() {
                    let milestone = Milestone::new(
                        self.input_buffer.trim().to_string(),
                        "New milestone - edit to add description".to_string(),
                    );
                    self.roadmap.add_milestone(milestone);
                    self.save_roadmap()?;
                    self.add_message("✨ New milestone added!");
                    
                    // Select the new milestone
                    let new_index = self.roadmap.milestones.len() - 1;
                    self.milestone_list_state.select(Some(new_index));
                }
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Esc => {
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Backspace => {
                self.input_buffer.pop();
            }
            KeyCode::Char(c) => {
                self.input_buffer.push(c);
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_edit_milestone_mode(&mut self, key: KeyEvent, id: Uuid) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Enter => {
                if !self.input_buffer.trim().is_empty() {
                    if let Some(milestone) = self.roadmap.get_milestone_mut(id) {
                        milestone.title = self.input_buffer.trim().to_string();
                        milestone.updated_at = chrono::Utc::now();
                    }
                    self.save_roadmap()?;
                    self.add_message("📝 Milestone updated!");
                }
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Esc => {
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Backspace => {
                self.input_buffer.pop();
            }
            KeyCode::Char(c) => {
                self.input_buffer.push(c);
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_confirm_delete_mode(&mut self, key: KeyEvent, id: Uuid) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Char('y') | KeyCode::Char('Y') => {
                self.roadmap.remove_milestone(id);
                self.save_roadmap()?;
                self.add_message("🗑️ Milestone deleted!");
                
                // Adjust selection after deletion
                if let Some(selected) = self.milestone_list_state.selected() {
                    if selected >= self.roadmap.milestones.len() && !self.roadmap.milestones.is_empty() {
                        self.milestone_list_state.select(Some(self.roadmap.milestones.len() - 1));
                    } else if self.roadmap.milestones.is_empty() {
                        self.milestone_list_state.select(None);
                    }
                }
                
                self.mode = AppMode::Normal;
            }
            KeyCode::Char('n') | KeyCode::Char('N') | KeyCode::Esc => {
                self.mode = AppMode::Normal;
            }
            _ => {}
        }
        Ok(())
    }

    fn move_selection_up(&mut self) {
        if self.roadmap.milestones.is_empty() {
            return;
        }

        let i = match self.milestone_list_state.selected() {
            Some(i) => {
                if i == 0 {
                    self.roadmap.milestones.len() - 1
                } else {
                    i - 1
                }
            }
            None => 0,
        };
        self.milestone_list_state.select(Some(i));
    }

    fn move_selection_down(&mut self) {
        if self.roadmap.milestones.is_empty() {
            return;
        }

        let i = match self.milestone_list_state.selected() {
            Some(i) => {
                if i >= self.roadmap.milestones.len() - 1 {
                    0
                } else {
                    i + 1
                }
            }
            None => 0,
        };
        self.milestone_list_state.select(Some(i));
    }

    fn cycle_status(&mut self) {
        if let Some(selected) = self.milestone_list_state.selected() {
            if let Some(milestone) = self.roadmap.milestones.get_mut(selected) {
                let new_status = match milestone.status {
                    Status::NotStarted => Status::InProgress,
                    Status::InProgress => Status::Completed,
                    Status::Completed => Status::Blocked,
                    Status::Blocked => Status::NotStarted,
                };
                milestone.update_status(new_status);
                let status_msg = format!("🔄 Status changed to {}", new_status.as_str());
                self.add_message(&status_msg);
            }
        }
    }

    fn cycle_priority(&mut self) {
        if let Some(selected) = self.milestone_list_state.selected() {
            if let Some(milestone) = self.roadmap.milestones.get_mut(selected) {
                milestone.priority = match milestone.priority {
                    Priority::Low => Priority::Medium,
                    Priority::Medium => Priority::High,
                    Priority::High => Priority::Critical,
                    Priority::Critical => Priority::Low,
                };
                milestone.updated_at = chrono::Utc::now();
                let priority_msg = format!("⚡ Priority changed to {}", milestone.priority.as_str());
                self.add_message(&priority_msg);
            }
        }
    }

    fn save_roadmap(&self) -> Result<(), Box<dyn Error>> {
        self.storage.save_roadmap(&self.roadmap)
    }

    fn add_message(&mut self, message: &str) {
        self.messages.push(message.to_string());
        if self.messages.len() > 5 {
            self.messages.remove(0);
        }
    }

    pub fn draw(&mut self, f: &mut Frame) {
        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(3), // Title
                Constraint::Min(10),   // Main content
                Constraint::Length(3), // Status/Messages
            ])
            .split(f.area());

        // Title
        let title = Paragraph::new("🚀 RUIDMAP - Interactive Roadmap Manager 🚀")
            .style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL));
        f.render_widget(title, chunks[0]);

        // Main content
        if self.show_help {
            self.draw_help(f, chunks[1]);
        } else {
            self.draw_main_content(f, chunks[1]);
        }

        // Status bar
        self.draw_status_bar(f, chunks[2]);

        // Modal dialogs
        self.draw_modals(f, f.area());
    }

    fn draw_help(&self, f: &mut Frame, area: Rect) {
        let help_text = ui::get_help_text().join("\n");
        let help = Paragraph::new(help_text)
            .style(Style::default().fg(Color::White))
            .block(Block::default()
                .title("📚 Help")
                .borders(Borders::ALL)
                .style(Style::default().fg(Color::Yellow)))
            .wrap(Wrap { trim: true });
        f.render_widget(help, area);
    }

    fn draw_main_content(&mut self, f: &mut Frame, area: Rect) {
        if self.roadmap.milestones.is_empty() {
            // Welcome screen
            let welcome = Paragraph::new(ui::create_welcome_screen(area))
                .style(Style::default().fg(Color::White))
                .alignment(Alignment::Left)
                .wrap(Wrap { trim: true });
            f.render_widget(welcome, area);
        } else {
            // Split into milestone list and details
            let chunks = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([Constraint::Percentage(50), Constraint::Percentage(50)])
                .split(area);

            self.draw_milestone_list(f, chunks[0]);
            self.draw_milestone_details(f, chunks[1]);
        }
    }

    fn draw_milestone_list(&mut self, f: &mut Frame, area: Rect) {
        // Update mouse area for milestone list
        self.milestone_list_area = area;
        
        let items: Vec<ListItem> = self
            .roadmap
            .milestones
            .iter()
            .map(|milestone| {
                let style = Style::default().fg(milestone.status.color());
                let content = format!(
                    "{} {} [{}] {}",
                    milestone.status.icon(),
                    milestone.title,
                    milestone.priority.as_str().chars().next().unwrap(),
                    ui::create_progress_bar(milestone.progress_percentage(), 10)
                );
                ListItem::new(content).style(style)
            })
            .collect();

        let milestones_list = List::new(items)
            .block(Block::default()
                .title("📋 Milestones")
                .borders(Borders::ALL))
            .highlight_style(Style::default().add_modifier(Modifier::REVERSED))
            .highlight_symbol("🎯 ");

        f.render_stateful_widget(milestones_list, area, &mut self.milestone_list_state);
    }

    fn draw_milestone_details(&self, f: &mut Frame, area: Rect) {
        if let Some(selected) = self.milestone_list_state.selected() {
            if let Some(milestone) = self.roadmap.milestones.get(selected) {
                let details = format!(
                    "{}\n\n📝 Description:\n{}\n\n⏰ Created: {}\n📅 Updated: {}\n\n📊 Progress: {:.1}%\n{}",
                    ui::create_milestone_card(
                        &milestone.title,
                        milestone.status.as_str(),
                        milestone.priority.as_str(),
                        milestone.progress_percentage(),
                        area
                    ),
                    milestone.description,
                    milestone.created_at.format("%Y-%m-%d %H:%M"),
                    milestone.updated_at.format("%Y-%m-%d %H:%M"),
                    milestone.progress_percentage(),
                    if milestone.resources.is_empty() {
                        String::new()
                    } else {
                        format!("\n📚 Resources:\n{}", milestone.resources.join("\n"))
                    }
                );

                let details_widget = Paragraph::new(details)
                    .style(Style::default().fg(Color::White))
                    .block(Block::default()
                        .title("📄 Details")
                        .borders(Borders::ALL))
                    .wrap(Wrap { trim: true });

                f.render_widget(details_widget, area);
            }
        } else {
            // Show overall stats
            let stats = ui::create_stats_panel(
                self.roadmap.milestones.len(),
                self.roadmap.completed_count(),
                self.roadmap.in_progress_count(),
                self.roadmap.pending_count(),
                self.roadmap.blocked_count(),
                self.roadmap.overall_progress(),
                area,
            );

            let stats_widget = Paragraph::new(stats)
                .style(Style::default().fg(Color::White))
                .block(Block::default()
                    .title("📊 Overview")
                    .borders(Borders::ALL))
                .wrap(Wrap { trim: true });

            f.render_widget(stats_widget, area);
        }
    }

    fn draw_status_bar(&mut self, f: &mut Frame, area: Rect) {
        let mode_text = match self.mode {
            AppMode::Normal => "NORMAL",
            AppMode::Help => "HELP",
            AppMode::AddMilestone => "ADD MILESTONE",
            AppMode::EditMilestone(_) => "EDIT MILESTONE",
            AppMode::ConfirmDelete(_) => "CONFIRM DELETE",
            AppMode::AddFolder => "ADD FOLDER",
            AppMode::EditFolder(_) => "EDIT FOLDER",
            AppMode::SelectFolder(_) => "SELECT FOLDER",
        };

        let messages_text = if self.messages.is_empty() {
            "Ready".to_string()
        } else {
            self.messages.last().unwrap().clone()
        };

        // Create button areas for mouse interaction
        let help_button_width = 8; // "[Help]" length
        let add_button_width = 7; // "[Add]" length  
        let folder_button_width = 10; // "[Folder]" length
        
        self.help_button_area = Rect::new(area.x + area.width - help_button_width - 2, area.y, help_button_width, 1);
        self.add_button_area = Rect::new(area.x + area.width - help_button_width - add_button_width - 4, area.y, add_button_width, 1);
        self.folder_button_area = Rect::new(area.x + area.width - help_button_width - add_button_width - folder_button_width - 6, area.y, folder_button_width, 1);

        let status_text = format!("[{}] {} | [Folder] [Add] [Help]", mode_text, messages_text);
        
        let status = Paragraph::new(status_text)
            .style(Style::default().fg(Color::Yellow))
            .alignment(Alignment::Left)
            .block(Block::default().borders(Borders::ALL));

        f.render_widget(status, area);
    }

    fn draw_modals(&self, f: &mut Frame, area: Rect) {
        match &self.mode {
            AppMode::AddMilestone => {
                let modal_area = centered_rect(60, 20, area);
                f.render_widget(Clear, modal_area);
                
                let input_text = format!("Enter milestone title:\n\n{}", self.input_buffer);
                let input = Paragraph::new(input_text)
                    .style(Style::default().fg(Color::White))
                    .block(Block::default()
                        .title("✨ Add New Milestone")
                        .borders(Borders::ALL)
                        .style(Style::default().fg(Color::Green)));
                
                f.render_widget(input, modal_area);
            }
            AppMode::EditMilestone(_) => {
                let modal_area = centered_rect(60, 20, area);
                f.render_widget(Clear, modal_area);
                
                let input_text = format!("Edit milestone title:\n\n{}", self.input_buffer);
                let input = Paragraph::new(input_text)
                    .style(Style::default().fg(Color::White))
                    .block(Block::default()
                        .title("📝 Edit Milestone")
                        .borders(Borders::ALL)
                        .style(Style::default().fg(Color::Blue)));
                
                f.render_widget(input, modal_area);
            }
            AppMode::ConfirmDelete(_) => {
                let modal_area = centered_rect(50, 15, area);
                f.render_widget(Clear, modal_area);
                
                let confirm_text = "Are you sure you want to delete this milestone?\n\nPress 'Y' to confirm, 'N' to cancel";
                let confirm = Paragraph::new(confirm_text)
                    .style(Style::default().fg(Color::White))
                    .alignment(Alignment::Center)
                    .block(Block::default()
                        .title("🗑️ Confirm Delete")
                        .borders(Borders::ALL)
                        .style(Style::default().fg(Color::Red)));
                
                f.render_widget(confirm, modal_area);
            }
            _ => {}
        }
    }
}

fn centered_rect(percent_x: u16, percent_y: u16, r: Rect) -> Rect {
    let popup_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Percentage((100 - percent_y) / 2),
            Constraint::Percentage(percent_y),
            Constraint::Percentage((100 - percent_y) / 2),
        ])
        .split(r);

    Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage((100 - percent_x) / 2),
            Constraint::Percentage(percent_x),
            Constraint::Percentage((100 - percent_x) / 2),
        ])
        .split(popup_layout[1])[1]
}

// Missing methods for the new functionality
impl App {
    fn handle_add_folder_mode(&mut self, key: KeyEvent) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Enter => {
                if !self.input_buffer.trim().is_empty() {
                    let folder = Folder::new(
                        self.input_buffer.trim().to_string(),
                        "New folder - edit to add description".to_string(),
                    );
                    self.roadmap.add_folder(folder);
                    self.save_roadmap()?;
                    self.add_message("📁 New folder created!");
                }
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Esc => {
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Backspace => {
                self.input_buffer.pop();
            }
            KeyCode::Char(c) => {
                self.input_buffer.push(c);
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_edit_folder_mode(&mut self, key: KeyEvent, id: Uuid) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Enter => {
                if !self.input_buffer.trim().is_empty() {
                    if let Some(folder) = self.roadmap.get_folder_mut(id) {
                        folder.name = self.input_buffer.trim().to_string();
                        folder.updated_at = chrono::Utc::now();
                    }
                    self.save_roadmap()?;
                    self.add_message("📝 Folder updated!");
                }
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Esc => {
                self.mode = AppMode::Normal;
                self.input_buffer.clear();
            }
            KeyCode::Backspace => {
                self.input_buffer.pop();
            }
            KeyCode::Char(c) => {
                self.input_buffer.push(c);
            }
            _ => {}
        }
        Ok(())
    }

    fn handle_select_folder_mode(&mut self, key: KeyEvent, milestone_id: Uuid) -> Result<(), Box<dyn Error>> {
        match key.code {
            KeyCode::Enter => {
                if let Some(selected) = self.folder_list_state.selected() {
                    if selected < self.roadmap.folders.len() {
                        let folder_id = self.roadmap.folders[selected].id;
                        if let Some(milestone) = self.roadmap.get_milestone_mut(milestone_id) {
                            milestone.assign_to_folder(Some(folder_id));
                        }
                        if let Some(folder) = self.roadmap.get_folder_mut(folder_id) {
                            folder.add_milestone(milestone_id);
                        }
                        self.save_roadmap()?;
                        self.add_message("📂 Milestone moved to folder!");
                    }
                }
                self.mode = AppMode::Normal;
            }
            KeyCode::Esc => {
                self.mode = AppMode::Normal;
            }
            KeyCode::Up => {
                if !self.roadmap.folders.is_empty() {
                    let i = match self.folder_list_state.selected() {
                        Some(i) => {
                            if i == 0 {
                                self.roadmap.folders.len() - 1
                            } else {
                                i - 1
                            }
                        }
                        None => 0,
                    };
                    self.folder_list_state.select(Some(i));
                }
            }
            KeyCode::Down => {
                if !self.roadmap.folders.is_empty() {
                    let i = match self.folder_list_state.selected() {
                        Some(i) => {
                            if i >= self.roadmap.folders.len() - 1 {
                                0
                            } else {
                                i + 1
                            }
                        }
                        None => 0,
                    };
                    self.folder_list_state.select(Some(i));
                }
            }
            _ => {}
        }
        Ok(())
    }

    fn cycle_view_mode(&mut self) {
        self.view_mode = match self.view_mode {
            ViewMode::List => ViewMode::Tree,
            ViewMode::Tree => ViewMode::Kanban,
            ViewMode::Kanban => ViewMode::List,
        };
        self.add_message(&format!("🔄 View mode: {:?}", self.view_mode));
    }

    fn move_tree_selection_up(&mut self) {
        let total_items = self.roadmap.folders.len() + self.roadmap.milestones.len();
        if total_items == 0 {
            return;
        }

        let i = match self.folder_list_state.selected() {
            Some(i) => {
                if i == 0 {
                    total_items - 1
                } else {
                    i - 1
                }
            }
            None => 0,
        };
        self.folder_list_state.select(Some(i));
    }

    fn move_tree_selection_down(&mut self) {
        let total_items = self.roadmap.folders.len() + self.roadmap.milestones.len();
        if total_items == 0 {
            return;
        }

        let i = match self.folder_list_state.selected() {
            Some(i) => {
                if i >= total_items - 1 {
                    0
                } else {
                    i + 1
                }
            }
            None => 0,
        };
        self.folder_list_state.select(Some(i));
    }

    fn show_celebration_animation(&mut self) {
        self.show_celebration = true;
        self.celebration_start = Some(Instant::now());
    }
}