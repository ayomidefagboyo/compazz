import { Header } from './components/Header';
import { PredictionMarketsPage } from './pages/PredictionMarketsPage';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="w-full">
        <PredictionMarketsPage />
      </main>
    </div>
  );
}

export default App;