import { useEffect, useState } from 'react';
import { Typography, Row, Col, Spin, Empty, Button, message, Space } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Header } from '../../components/Header/Header';
import { TestCard } from '../../components/TestCard/TestCard';
import { useTestStore } from '../../app/store/testStore';
import testsData from '../../app/data/tests.json';
import './Main.scss';

const { Title } = Typography;

// 👇 ИМПОРТ ВСЕХ ТЕСТОВ
import goldenRules from '../../app/data/golden-rules.json';
import fountainSafety from '../../app/data/fountain-safety.json';

// 👇 КАРТА ТЕСТОВ (добавляй новые сюда)
const testMap: Record<string, any> = {
  'golden-rules': goldenRules,
  'fountain-safety': fountainSafety,
};

export function Main() {
  const { tests, syncTests, attempts } = useTestStore();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Загрузка свежих тестов из JSON
  const loadFreshTests = () => {
    return testsData.tests
      .map((testInfo) => testMap[testInfo.id])
      .filter(Boolean);
  };

  // Принудительная синхронизация
  const performSync = (showMessage = false) => {
    const freshTests = loadFreshTests();
    syncTests(freshTests);
    
    if (showMessage) {
      message.success(`Тесты синхронизированы (${freshTests.length} шт.)`);
    }
  };

  // При загрузке страницы — всегда синхронизируем тесты из JSON
  useEffect(() => {
    setLoading(true);
    performSync(false);
    setLoading(false);
  }, []);

  // Ручная синхронизация по кнопке
  const handleManualSync = () => {
    setSyncing(true);
    // Имитируем задержку для красоты
    setTimeout(() => {
      performSync(true);
      setSyncing(false);
    }, 500);
  };

  return (
    <div className="main-page">
      <Header />
      <div className="main-content">
        <div className="hero-section">

            <Space direction='horizontal'>
            <strong style={{ fontSize: 30 }}>🎯</strong>
          <Title level={1}> Проверь свои знания</Title>
            </Space>
      
          <Title level={5} type="secondary">
            Выберите тест и начните подготовку
          </Title>
        </div>

        {/* 👇 КНОПКА ПРИНУДИТЕЛЬНОЙ СИНХРОНИЗАЦИИ */}
        <div className="sync-section">
          <Button
            icon={<SyncOutlined spin={syncing} />}
            onClick={handleManualSync}
            loading={syncing}
            size="small"
          >
            Обновить тесты
          </Button>
          <span className="sync-hint">
            Всего тестов: {tests.length} | Попыток: {attempts.length}
          </span>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : tests.length === 0 ? (
          <Empty description="Тесты не найдены" />
        ) : (
          <Row gutter={[24, 24]} className="tests-grid">
            {tests.map((test) => (
              <Col key={test.id} xs={24} sm={12} lg={8}>
                <TestCard
                  id={test.id}
                  title={test.title}
                  description={test.description}
                  hasTickets={test.hasTickets}
                  ticketsCount={test.tickets?.length}
                  questionsCount={test.questions?.length}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}