pub mod detail;

use ratatui::{
    widgets::{Block, Borders, List, ListItem, Paragraph},
    layout::{Layout, Constraint, Direction, Rect},
    style::{Style, Color, Modifier},
    Frame,
};
use std::sync::{Arc, RwLock};
use super::AppState;

pub fn draw(f: &mut Frame, state: Arc<RwLock<AppState>>) {
    let state_lock = state.read().unwrap();
    
    // Main split: Vertical (Dashboard vs Log)
    let main_chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),  // Header
            Constraint::Min(10),    // Main Content (Workflows + Detail)
            Constraint::Length(10), // Log
        ])
        .split(f.area());

    // 1. Header
    draw_header(f, main_chunks[0], &state_lock);

    // 2. Middle Content (Horizontal split for Detail)
    let show_detail = !state_lock.workflows.is_empty();
    let mid_constraints = if show_detail {
        vec![Constraint::Percentage(45), Constraint::Percentage(55)]
    } else {
        vec![Constraint::Percentage(100)]
    };

    let mid_chunks = Layout::default()
        .direction(Direction::Horizontal)
        .constraints(mid_constraints)
        .split(main_chunks[1]);

    draw_workflow_list(f, mid_chunks[0], &state_lock);
    
    if show_detail {
        detail::draw_detail(f, mid_chunks[1], &state_lock);
    }

    // 3. Log
    draw_log(f, main_chunks[2], &state_lock);
}

fn draw_header(f: &mut Frame, area: Rect, state: &AppState) {
    let sse_status = match state.sse_status {
        super::app::SseStatus::Connected => "LIVE".to_string(),
        super::app::SseStatus::Reconnecting { attempt } => format!("RECONNECTING ({})", attempt),
        super::app::SseStatus::Disconnected => "OFFLINE".to_string(),
    };
    let sse_color = match state.sse_status {
        super::app::SseStatus::Connected => Color::Green,
        super::app::SseStatus::Reconnecting { .. } => Color::Yellow,
        super::app::SseStatus::Disconnected => Color::Red,
    };

    let header_text = format!(" PhaseSpace Commander Shell (v0.2.0) | Stream: {} ", sse_status);
    let header = Paragraph::new(header_text)
        .style(Style::default().fg(sse_color))
        .block(Block::default().borders(Borders::ALL).title(" Status "));
    f.render_widget(header, area);
}

fn draw_workflow_list(f: &mut Frame, area: Rect, state: &AppState) {
    let workflows: Vec<ListItem> = state.workflows
        .iter()
        .enumerate()
        .map(|(i, w)| {
            let style = if i == state.selected {
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)
            } else {
                Style::default()
            };
            ListItem::new(format!("{:<20} [{:<8}]", w.name, w.trust)).style(style)
        })
        .collect();

    let list = List::new(workflows)
        .block(Block::default().borders(Borders::ALL).title(" Workflows "));
    f.render_widget(list, area);
}

fn draw_log(f: &mut Frame, area: Rect, state: &AppState) {
    let log_items: Vec<ListItem> = state.log
        .iter()
        .take(area.height as usize - 2) // Adjust for borders
        .map(|l| ListItem::new(format!("[{}] {}", l.level, l.msg)))
        .collect();
    
    let log_list = List::new(log_items)
        .block(Block::default().borders(Borders::ALL).title(" Real-time Governance Log "));
    f.render_widget(log_list, area);
}
