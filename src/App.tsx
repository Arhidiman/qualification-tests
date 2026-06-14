import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AppProviders } from './app/providers/AppProviders';
import { Main } from './pages/Main/Main';
import { TestPage } from './pages/Test/TestPage';
import { Results } from './pages/Results/Results';
import { ResultDetail } from './pages/ResultDetail/ResultDetail';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00a8ff',
          borderRadius: 8,
          colorBgContainer: '#1e1e2e',
        },
      }}
    >
      <AppProviders>
        <BrowserRouter basename="/qualification-tests">
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/test/:testId" element={<TestPage />} />
              <Route path="/test/:testId/start" element={<TestPage />} />
              <Route path="/test/:testId/ticket/:ticketId" element={<TestPage />} />
              <Route path="/results" element={<Results />} />
              <Route path="/result/:attemptId" element={<ResultDetail />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AppProviders>
    </ConfigProvider>
  );
}

export default App;