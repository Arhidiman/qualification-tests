// src/pages/Results/Results.tsx
import { Typography, Card, Statistic, Row, Col, Table, Tag, Button, Empty, Modal, message } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { useTestStore } from '../../app/store/testStore';
import { useState } from 'react';
import type { Attempt } from '../../app/store/testStore';
import './Results.scss';

const { Title } = Typography;

export function Results() {
  const navigate = useNavigate();
  const { attempts, addAttempt } = useTestStore(); // addAttempt не используется, но оставим для совместимости
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Получаем store и метод для очистки напрямую
  const store = useTestStore();
  
  // Фильтруем попытки по выбранному тесту
  const filteredAttempts = selectedTestId
    ? attempts.filter((a) => a.testId === selectedTestId)
    : attempts;

  const testIds = [...new Set(attempts.map((a) => a.testId))];
  const testInfo = testIds.map((id) => {
    const attempt = attempts.find((a) => a.testId === id);
    return { id, title: attempt?.testTitle || id };
  });

  const totalAttempts = filteredAttempts.length;
  const successfulAttempts = filteredAttempts.filter((a) => a.percentage >= 70).length;
  const avgPercentage =
    totalAttempts > 0
      ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
      : 0;
  const bestPercentage = totalAttempts > 0 ? Math.max(...filteredAttempts.map((a) => a.percentage)) : 0;

  // Сброс статистики
  const handleResetStats = () => {
    Modal.confirm({
      title: 'Сброс статистики',
      content: 'Вы уверены, что хотите удалить всю историю попыток? Это действие нельзя отменить.',
      okText: 'Да, сбросить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: () => {
        // Очищаем store от attempts
        store.attempts = [];
        // Сохраняем пустой массив в localStorage
        localStorage.setItem('test-storage', JSON.stringify({
          state: { attempts: [] },
          version: 0
        }));
        message.success('Статистика успешно сброшена');
        // Принудительно обновляем компонент
        window.location.reload();
      },
    });
  };

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString('ru-RU'),
    },
    {
      title: 'Тест',
      dataIndex: 'testTitle',
      key: 'testTitle',
      render: (text: string, record: Attempt) => {
        if (record.ticketTitle) {
          return <span>{text} — <Tag color="orange">{record.ticketTitle}</Tag></span>;
        }
        return <span>{text}</span>;
      },
    },
    {
      title: 'Результат',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (pct: number) => (
        <Tag color={pct >= 70 ? 'green' : pct >= 50 ? 'orange' : 'red'}>
          {pct}%
        </Tag>
      ),
    },
    {
      title: 'Правильно',
      dataIndex: 'correctCount',
      key: 'correctCount',
      render: (correct: number, record: Attempt) => `${correct} / ${record.totalQuestions}`,
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: Attempt) => (
        <Button 
          type="link" 
          onClick={() => {
            if (record.ticketId) {
              navigate(`/test/${record.testId}/ticket/${record.ticketId}`);
            } else {
              navigate(`/test/${record.testId}/start`);
            }
          }}
        >
          Пройти заново
        </Button>
      ),
    },
  ];

  return (
    <div className="results-page">
      <Header />
      <div className="results-content">
        <Title level={2} className="results-title">
          <TrophyOutlined /> Статистика
        </Title>

        {attempts.length === 0 ? (
          <Empty
            description="Пока нет пройденных тестов"
            className="empty-state"
          >
            <Button type="primary" onClick={() => navigate('/')}>
              Выбрать тест
            </Button>
          </Empty>
        ) : (
          <>
            <Row gutter={[16, 16]} className="stats-row">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Всего попыток"
                    value={totalAttempts}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Успешных (≥70%)"
                    value={successfulAttempts}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Средний результат"
                    value={avgPercentage}
                    suffix="%"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Лучший результат"
                    value={bestPercentage}
                    suffix="%"
                    valueStyle={{ color: '#00a8ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {testIds.length > 1 && (
              <div className="filter-section">
                <Button
                  type={!selectedTestId ? 'primary' : 'default'}
                  onClick={() => setSelectedTestId(null)}
                >
                  Все тесты
                </Button>
                {testInfo.map((test) => (
                  <Button
                    key={test.id}
                    type={selectedTestId === test.id ? 'primary' : 'default'}
                    onClick={() => setSelectedTestId(test.id)}
                  >
                    {test.title}
                  </Button>
                ))}
              </div>
            )}

            <Card className="history-card" title="📋 История попыток">
              <Table
                columns={columns}
                dataSource={filteredAttempts}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            <div className="action-buttons">
              <Button size="large" onClick={() => navigate('/')}>
                <ReloadOutlined /> Пройти другой тест
              </Button>
              <Button size="large" danger icon={<DeleteOutlined />} onClick={handleResetStats}>
                Сбросить статистику
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}