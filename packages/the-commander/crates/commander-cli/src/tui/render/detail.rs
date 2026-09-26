use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame,
};
use crate::tui::app::AppState;

pub fn draw_detail(f: &mut Frame, area: Rect, state: &AppState) {
    let Some(wf) = state.workflows.get(state.selected) else {
        let empty = Paragraph::new("No workflow selected.")
            .block(Block::default().borders(Borders::ALL).title(" Detail "));
        f.render_widget(empty, area);
        return;
    };

    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),  // identity header
            Constraint::Length(7),  // governance fields (increased slightly)
            Constraint::Min(0),     // task metadata / last witness
        ])
        .split(area);

    // — Identity header —
    let header = Paragraph::new(vec![
        Line::from(vec![
            Span::styled(&wf.name, Style::default().add_modifier(Modifier::BOLD)),
            Span::raw("  "),
            Span::styled(&wf.id, Style::default().fg(Color::DarkGray)),
        ]),
    ])
    .block(Block::default().borders(Borders::ALL).title(" Workflow "));
    f.render_widget(header, chunks[0]);

    // — Governance fields —
    let trust_color = match wf.trust.to_lowercase().as_str() {
        "internal" => Color::Cyan,
        "external" => Color::Yellow,
        _ => Color::Gray,
    };
    let alp_color = match wf.alp_status.as_str() {
        "PASS" => Color::Green,
        "BLOCKED" => Color::Red,
        _ => Color::Yellow,
    };
    let gov = Paragraph::new(vec![
        Line::from(vec![
            Span::raw("  Trust Level   "),
            Span::styled(&wf.trust, Style::default().fg(trust_color).add_modifier(Modifier::BOLD)),
        ]),
        Line::from(vec![
            Span::raw("  ALP Status    "),
            Span::styled(&wf.alp_status, Style::default().fg(alp_color).add_modifier(Modifier::BOLD)),
        ]),
        Line::from(vec![
            Span::raw("  Server        "),
            Span::styled(&wf.server, Style::default().fg(Color::Gray)),
        ]),
        Line::from(vec![
            Span::raw("  Last SAT      "),
            Span::styled(
                wf.last_sat_token_id.as_deref().unwrap_or("none"),
                Style::default().fg(Color::DarkGray),
            ),
            Span::raw(" (expired — historical)"),
        ]),
        Line::from(vec![
            Span::raw("  Last Run      "),
            Span::styled(&wf.last_run, Style::default().fg(Color::Gray)),
        ]),
    ])
    .block(Block::default().borders(Borders::ALL).title(" Governance "));
    f.render_widget(gov, chunks[1]);

    // — Last witness SHA —
    let witness_text = wf.last_witness_sha
        .as_deref()
        .unwrap_or("no witness recorded");
    let witness = Paragraph::new(witness_text)
        .wrap(Wrap { trim: true })
        .block(Block::default().borders(Borders::ALL).title(" Last UnifiedWitness SHA "));
    f.render_widget(witness, chunks[2]);
}
