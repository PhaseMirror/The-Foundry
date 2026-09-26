use anyhow::Result;
use std::process::Command;

pub struct KaniRunner;

impl KaniRunner {
    pub fn verify(package: Option<&str>, target_dir: Option<&str>) -> Result<KaniReport> {
        let mut cmd = Command::new("cargo");
        cmd.arg("kani");
        if let Some(pkg) = package {
            cmd.arg("-p").arg(pkg);
        }
        if let Some(td) = target_dir {
            cmd.arg("--target-dir").arg(td);
        }

        let output = cmd.output()?;
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let success = output.status.success();

        Ok(KaniReport {
            success,
            stdout,
            stderr,
            exit_code: output.status.code(),
        })
    }
}

#[derive(Debug, Clone)]
pub struct KaniReport {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}
