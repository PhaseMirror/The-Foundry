from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import daemon.__main__ as daemon_main


class _StubWatchdog:
    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def epsilon_adjust(self, delta: float, *, reason: str):
        return {
            "status": "accepted",
            "delta": delta,
            "reason": reason,
            "new_epsilon": 0.06,
        }


def test_main_runs_epsilon_adjust_command(monkeypatch, capsys):
    monkeypatch.setattr(daemon_main, "DaemonWatchdog", lambda **kwargs: _StubWatchdog(**kwargs))

    exit_code = daemon_main.main(["epsilon-adjust", "--delta", "0.01", "--reason", "cli-test"])
    captured = capsys.readouterr()

    assert exit_code == 0
    assert '"status": "accepted"' in captured.out
    assert '"reason": "cli-test"' in captured.out


def test_main_requires_delta_for_epsilon_adjust(capsys):
    try:
        daemon_main.main(["epsilon-adjust"])
    except SystemExit as exc:
        captured = capsys.readouterr()
        assert exc.code == 2
        assert "requires --delta" in captured.err
    else:  # pragma: no cover - defensive branch
        raise AssertionError("epsilon-adjust without --delta must exit")