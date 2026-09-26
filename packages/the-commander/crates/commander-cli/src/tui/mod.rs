pub mod app;
pub mod render;
pub mod event;
pub mod sse;

use std::sync::{Arc, RwLock};
use std::time::Duration;
use anyhow::Result;
use crossterm::{
    event::EventStream,
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use app::AppState;
use event::AppEvent;

pub async fn run(state: Arc<RwLock<AppState>>) -> Result<()> {
    // 1. Setup Terminal
    enable_raw_mode()?;
    let mut stdout = std::io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // 2. Main Loop
    let mut events = EventStream::new();
    let mut ticker = tokio::time::interval(Duration::from_millis(100));

    loop {
        terminal.draw(|f| render::draw(f, Arc::clone(&state)))?;

        tokio::select! {
            _ = ticker.tick() => {
                // Redraw on tick
            }
            ev = event::next_event(&mut events) => {
                match ev {
                    Ok(Some(AppEvent::Quit)) => break,
                    Ok(Some(AppEvent::Up)) => state.write().unwrap().move_up(),
                    Ok(Some(AppEvent::Down)) => state.write().unwrap().move_down(),
                    Ok(Some(AppEvent::Tab)) => {
                        let mut s = state.write().unwrap();
                        s.active_pane = if s.active_pane == app::Pane::Workflows {
                            app::Pane::Log
                        } else {
                            app::Pane::Workflows
                        };
                    }
                    _ => {}
                }
            }
        }
    }

    // 3. Restore Terminal
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;

    Ok(())
}
