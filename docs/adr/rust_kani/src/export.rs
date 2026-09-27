//! Utilities to render ADRs as Markdown and HTML.
use super::*;
use std::fs::{self, File};
use std::io::Write;

/// Export a single ADR to a Markdown file in `docs/`.
pub fn export_md(adr: &ADR, out_dir: &str) -> std::io::Result<()> {
    let path = format!("{}/ADR_{:03}.md", out_dir, adr.id);
    let mut file = File::create(&path)?;
    writeln!(file, "# ADR {} – {}", adr.id, adr.title)?;
    writeln!(file, "\n**Status:** `{:?}`", adr.status)?;
    writeln!(file, "\n## Context\n{}", adr.context)?;
    writeln!(file, "\n## Decision\n{}", adr.decision)?;
    writeln!(file, "\n## Consequences")?;
    for (i, c) in adr.consequences.iter().enumerate() {
        writeln!(file, "- {}. {}", i + 1, c)?;
    }
    if let Some(sup) = adr.supersedes {
        writeln!(file, "\n**Supersedes:** ADR {}", sup)?;
    }
    if !adr.links.is_empty() {
        writeln!(file, "\n## Links")?;
        for link in &adr.links {
            writeln!(file, "- [{}]({})", link.description, link.url)?;
        }
    }
    Ok(())
}

/// Generate a simple HTML index of all ADR markdown files in `docs/`.
pub fn generate_html_index(docs_dir: &str) -> std::io::Result<()> {
    let index_path = format!("{}/index.html", docs_dir);
    let mut file = File::create(&index_path)?;
    writeln!(file, "<html><head><title>ADR Index</title></head><body>")?;
    writeln!(file, "<h1>Architecture Decision Records</h1><ul>")?;
    for entry in fs::read_dir(docs_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("md") {
            if let Some(name) = path.file_name().and_then(|s| s.to_str()) {
                let html_name = name.replace(".md", ".html");
                writeln!(file, "<li><a href='{}'>{}</a></li>", html_name, name)?;
            }
        }
    }
    writeln!(file, "</ul></body></html>")?;
    Ok(())
}
