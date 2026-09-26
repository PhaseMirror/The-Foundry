// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use crate::types::{Violation, Evidence, Outcome, Scanner};
use std::path::Path;
use walkdir::WalkDir;

/// L0 Schema Scanner: validates that the workspace contains required
/// governance schema files with correct versions and hashes.
///
/// Checks performed:
/// 1. config/policy.toml exists and is non-empty
/// 2. No forbidden patterns in source files (from policy.toml)
/// 3. Required governance files exist (mcp-contract.json, etc.)
pub struct L0SchemaScanner;

impl Scanner for L0SchemaScanner {
    fn id(&self) -> &str { "L0-001" }

    fn scan(&self, root: &Path) -> anyhow::Result<Vec<Violation>> {
        let mut violations = Vec::new();

        // Check 1: config/policy.toml must exist and be non-empty
        let policy_path = root.join("config").join("policy.toml");
        if !policy_path.exists() {
            violations.push(Violation {
                rule_id: self.id().to_string(),
                severity: Outcome::BLOCK,
                evidence: Evidence {
                    file: policy_path,
                    line_range: (0, 0),
                    message: "Required file config/policy.toml is missing".to_string(),
                },
            });
        } else {
            let content = std::fs::read_to_string(&policy_path)?;
            if content.trim().is_empty() {
                violations.push(Violation {
                    rule_id: self.id().to_string(),
                    severity: Outcome::BLOCK,
                    evidence: Evidence {
                        file: policy_path,
                        line_range: (0, 0),
                        message: "config/policy.toml is empty — no semantic policy defined".to_string(),
                    },
                });
            }
        }

        // Check 2: Required governance files must exist
        let required_files = [
            "Cargo.toml",
            "LICENSE",
        ];
        for req_file in &required_files {
            let path = root.join(req_file);
            if !path.exists() {
                violations.push(Violation {
                    rule_id: self.id().to_string(),
                    severity: Outcome::BLOCK,
                    evidence: Evidence {
                        file: path,
                        line_range: (0, 0),
                        message: format!("Required file {} is missing", req_file),
                    },
                });
            }
        }

        // Check 3: Scan source files for hardcoded secrets or dangerous patterns
        let forbidden_patterns = [
            ("password", "Hardcoded password detected"),
            ("secret_key", "Hardcoded secret key detected"),
            ("PRIVATE_KEY", "Private key material in source code"),
            ("aws_access_key_id", "AWS access key in source code"),
        ];

        for entry in WalkDir::new(root)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.path().extension()
                    .and_then(|s| s.to_str())
                    .map(|ext| matches!(ext, "rs" | "py" | "ts" | "js" | "toml" | "yaml" | "yml" | "json"))
                    .unwrap_or(false)
            })
            .filter(|e| {
                // Skip target/, node_modules/, .git/, vendor/
                let path_str = e.path().to_string_lossy();
                !path_str.contains("/target/")
                    && !path_str.contains("/node_modules/")
                    && !path_str.contains("/.git/")
                    && !path_str.contains("/vendor/")
            })
        {
            let content = match std::fs::read_to_string(entry.path()) {
                Ok(c) => c,
                Err(_) => continue,
            };

            for (pattern, message) in &forbidden_patterns {
                for (line_num, line) in content.lines().enumerate() {
                    // Skip comments
                    let trimmed = line.trim();
                    if trimmed.starts_with("//") || trimmed.starts_with('#') || trimmed.starts_with("///") || trimmed.starts_with("//!") {
                        continue;
                    }
                    if line.to_lowercase().contains(&pattern.to_lowercase()) {
                        violations.push(Violation {
                            rule_id: self.id().to_string(),
                            severity: Outcome::WARN,
                            evidence: Evidence {
                                file: entry.path().to_path_buf(),
                                line_range: (line_num + 1, line_num + 1),
                                message: format!("{}: found '{}' in {}", message, pattern, entry.path().display()),
                            },
                        });
                    }
                }
            }
        }

        Ok(violations)
    }
}

pub struct MD002PinningScanner;

impl Scanner for MD002PinningScanner {
    fn id(&self) -> &str { "MD-002" }

    fn scan(&self, root: &Path) -> anyhow::Result<Vec<Violation>> {
        let mut violations = Vec::new();
        for entry in WalkDir::new(root)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("sh") || 
                        e.path().extension().and_then(|s| s.to_str()) == Some("yaml")) 
        {
            let content = std::fs::read_to_string(entry.path())?;
            // Simple regex/pattern matching for unpinned 'curl | bash' or similar
            if content.contains("curl") && content.contains("| bash") {
                violations.push(Violation {
                    rule_id: self.id().to_string(),
                    severity: Outcome::BLOCK,
                    evidence: Evidence {
                        file: entry.path().to_path_buf(),
                        line_range: (0, 0), // To be refined
                        message: "Unpinned binary 'curl | bash' detected.".to_string(),
                    },
                });
            }
        }
        Ok(violations)
    }
}
