use std::process::Command;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AutomationAction {
    CargoBuild {
        package: Option<String>,
        release: bool,
    },
    CargoTest {
        package: Option<String>,
    },
    CargoKani {
        package: Option<String>,
    },
    GitCommit {
        message: String,
        paths: Vec<String>,
    },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AutomationOutcome {
    Success {
        stdout: String,
        stderr: String,
    },
    Failure {
        stdout: String,
        stderr: String,
        code: Option<i32>,
    },
}

impl AutomationAction {
    pub fn execute(&self) -> anyhow::Result<AutomationOutcome> {
        match self {
            AutomationAction::CargoBuild { package, release } => {
                let mut cmd = Command::new("cargo");
                cmd.arg("build");
                if *release {
                    cmd.arg("--release");
                }
                if let Some(pkg) = package {
                    cmd.arg("-p").arg(pkg);
                }
                Self::run_command(&mut cmd)
            }
            AutomationAction::CargoTest { package } => {
                let mut cmd = Command::new("cargo");
                cmd.arg("test");
                if let Some(pkg) = package {
                    cmd.arg("-p").arg(pkg);
                }
                Self::run_command(&mut cmd)
            }
            AutomationAction::CargoKani { package } => {
                let mut cmd = Command::new("cargo");
                cmd.arg("kani");
                if let Some(pkg) = package {
                    cmd.arg("-p").arg(pkg);
                }
                Self::run_command(&mut cmd)
            }
            AutomationAction::GitCommit { message, paths } => {
                let mut cmd = Command::new("git");
                cmd.arg("commit").arg("-m").arg(message);
                for p in paths {
                    cmd.arg(p);
                }
                Self::run_command(&mut cmd)
            }
        }
    }

    fn run_command(cmd: &mut Command) -> anyhow::Result<AutomationOutcome> {
        let output = cmd.output()?;
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        if output.status.success() {
            Ok(AutomationOutcome::Success { stdout, stderr })
        } else {
            Ok(AutomationOutcome::Failure {
                stdout,
                stderr,
                code: output.status.code(),
            })
        }
    }
}
