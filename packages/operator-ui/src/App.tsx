import { useState } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('IDLE')

  const triggerEvaluation = () => {
    setStatus('EVALUATING...')
    setTimeout(() => {
      setStatus('LOCKED & WITNESSED')
    }, 1500)
  }

  return (
    <>
      <header className="header">
        <h1 className="title text-glow">PhaseSpace OS</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MOC / Operator Zero</span>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
        </div>
      </header>
      
      <main className="dashboard-container">
        {/* Sidebar: Controls */}
        <section className="sidebar glass-panel">
          <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Command Surface</h2>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="button" onClick={triggerEvaluation}>
              Force Dissonance Evaluation
            </button>
            <button className="button" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
              Sync Archivum
            </button>
          </div>
        </section>

        {/* Center: MOC Visualization / State */}
        <section className="main-view">
          <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <h2 className="text-glow" style={{ fontSize: '2rem', color: status === 'LOCKED & WITNESSED' ? 'var(--success)' : 'var(--text-main)' }}>
              {status}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Multiplicity Core</p>
          </div>
        </section>

        {/* Right: Telemetry Overlay */}
        <section className="telemetry-panel glass-panel">
          <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Runtime Telemetry</h2>
          
          <div className="stat-box">
            <div className="stat-label">Sigma WASM Bridge</div>
            <div className="stat-value success">ONLINE</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-label">τ_R Threshold</div>
            <div className="stat-value">47.0699</div>
          </div>
          
          <div className="stat-box">
            <div className="stat-label">L_eff Upper Bound</div>
            <div className="stat-value">1.0</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Memory Allocation</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>280 MB</div>
          </div>
        </section>
      </main>
    </>
  )
}

export default App
