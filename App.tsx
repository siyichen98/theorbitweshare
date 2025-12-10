import React, { useState } from 'react';
import Experience from './components/Experience';
import UI from './components/UI';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.TREE_SHAPE);

  return (
    <div className="relative w-full h-screen bg-arix-dark overflow-hidden">
      <Experience appState={appState} />
      <UI appState={appState} setAppState={setAppState} />
    </div>
  );
};

export default App;
