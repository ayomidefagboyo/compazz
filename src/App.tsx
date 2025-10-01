import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { TradingAgentsPage } from './pages/TradingAgentsPage';
import { StreamPage } from './pages/StreamPage';
import { FundPage } from './pages/FundPage';
import { HowItWorksModal } from './components/HowItWorksModal';
import { ReferEarnModal } from './components/ReferEarnModal';
import { OnChainInfo } from './components/OnChainInfo';
import { TelegramProvider } from './contexts/TelegramContext';

function AppContent() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showReferEarn, setShowReferEarn] = useState(false);
  const [showOnChainInfo, setShowOnChainInfo] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Header
        onShowHowItWorks={() => setShowHowItWorks(true)}
        onShowReferEarn={() => setShowReferEarn(true)}
        onShowOnChainInfo={() => setShowOnChainInfo(true)}
      />
      <main className="w-full">
        <Routes>
          <Route path="/" element={<TradingAgentsPage />} />
          <Route path="/stream/:streamId" element={<StreamPage />} />
          <Route path="/fund/:fundId" element={<FundPage />} />
        </Routes>
      </main>

      {/* Modals */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

      <ReferEarnModal
        isOpen={showReferEarn}
        onClose={() => setShowReferEarn(false)}
      />

      <OnChainInfo
        isOpen={showOnChainInfo}
        onClose={() => setShowOnChainInfo(false)}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <TelegramProvider>
        <AppContent />
      </TelegramProvider>
    </Router>
  );
}

export default App;