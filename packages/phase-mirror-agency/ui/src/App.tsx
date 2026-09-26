import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import DissonanceGraphView from './pages/Dissonance';
import TripleLockInspector from './pages/TripleLock';
import QCalc from './pages/QCalc';
import PirtmWorkspace from './pages/Pirtm';
import Archivum from './pages/Archivum';
import Fleet from './pages/Fleet';
import Settings from './pages/Settings';
import McpTerminal from './pages/McpTerminal';

type View = 'dashboard' | 'dissonance' | 'triple-lock' | 'qcalc' | 'pirtm' | 'archivum' | 'fleet' | 'settings' | 'mcp';

const App = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'dissonance':
        return <DissonanceGraphView />;
      case 'triple-lock':
        return <TripleLockInspector />;
      case 'qcalc':
        return <QCalc />;
      case 'pirtm':
        return <PirtmWorkspace />;
      case 'mcp':
        return <McpTerminal />;
      case 'archivum':
        return <Archivum />;
      case 'fleet':
        return <Fleet />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell activeView={activeView} onViewChange={(v) => setActiveView(v as View)}>
      {renderView()}
    </AppShell>
  );
};

export default App;
