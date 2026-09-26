use crossterm::event::{EventStream, Event, KeyCode, KeyModifiers};
use futures::StreamExt;
use anyhow::Result;

pub enum AppEvent {
    Quit,
    Up,
    Down,
    Tab,
    Select,
}

pub async fn next_event(stream: &mut EventStream) -> Result<Option<AppEvent>> {
    if let Some(Ok(Event::Key(key))) = stream.next().await {
        let ev = match (key.code, key.modifiers) {
            (KeyCode::Char('q'), _) | (KeyCode::Char('c'), KeyModifiers::CONTROL) => Some(AppEvent::Quit),
            (KeyCode::Up, _) | (KeyCode::Char('k'), _) => Some(AppEvent::Up),
            (KeyCode::Down, _) | (KeyCode::Char('j'), _) => Some(AppEvent::Down),
            (KeyCode::Tab, _) => Some(AppEvent::Tab),
            (KeyCode::Enter, _) => Some(AppEvent::Select),
            _ => None,
        };
        return Ok(ev);
    }
    Ok(None)
}
