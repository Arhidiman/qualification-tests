import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Progress, message, Modal, Typography, Card, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Header } from '../../components/Header/Header';
import { QuestionBlock } from '../../components/QuestionBlock/QuestionBlock';
import { Pagination } from '../../components/Pagination/Pagination';
// import { TicketList } from '../../components/TicketList/TicketList';
import { TicketList } from '../../components/TicketList/TicketList';
import { useTestStore } from '../../app/store/testStore';
import { formatTime } from '../../libs/timer';
import './TestPage.scss';

const { Title } = Typography;
const PAGE_SIZE = 10;

export function TestPage() {
  const { testId, ticketId } = useParams();
  const navigate = useNavigate();
  const { 
    tests, 
    currentTest, 
    currentTicket,
    setCurrentTest, 
    setCurrentTicket,
    currentAnswers, 
    setAnswer, 
    clearCurrentAnswers, 
    addAttempt 
  } = useTestStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [timerActive, setTimerActive] = useState(true);

  // Загрузка теста
  useEffect(() => {
    if (testId && (!currentTest || currentTest.id !== testId)) {
      const test = tests.find((t) => t.id === testId);
      if (test) {
        setCurrentTest(test);
      } else {
        message.error('Тест не найден');
        navigate('/');
      }
    }
  }, [testId, tests, currentTest, setCurrentTest, navigate]);

  // Загрузка билета, если есть ticketId
  useEffect(() => {
    if (currentTest && currentTest.hasTickets && ticketId) {
      const ticket = currentTest.tickets?.find((t) => t.id === ticketId);
      if (ticket) {
        setCurrentTicket(ticket);
      } else {
        message.error('Билет не найден');
        navigate(`/test/${testId}`);
      }
    }
  }, [currentTest, ticketId, setCurrentTicket, navigate, testId]);

  // Таймер
  useEffect(() => {
    if (!timerActive || submitting) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          message.warning('Время вышло! Тест автоматически завершается.');
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, submitting]);

  const currentQuestions = useMemo(() => {
    if (currentTest?.hasTickets && currentTicket) {
      return currentTicket.questions;
    }
    if (currentTest && !currentTest.hasTickets) {
      return currentTest.questions || [];
    }
    return [];
  }, [currentTest, currentTicket]);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentQuestions.slice(start, start + PAGE_SIZE);
  }, [currentQuestions, currentPage]);

  const totalPages = Math.ceil(currentQuestions.length / PAGE_SIZE);

  const handleAnswerChange = (questionId: number, selectedIndexes: number[]) => {
    setAnswer(questionId, selectedIndexes);
  };

  const handleSubmit = () => {
    const unanswered = currentQuestions.filter(
      (q) => !currentAnswers[q.id] || currentAnswers[q.id].length === 0
    );

    if (unanswered.length > 0) {
      Modal.confirm({
        title: 'Внимание',
        content: `Вы не ответили на ${unanswered.length} вопрос${getDeclension(unanswered.length)}. Завершить тест?`,
        onOk: () => finishTest(),
      });
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setSubmitting(true);
    setTimerActive(false);

    let correctCount = 0;
    const userAnswers: number[][] = [];

    for (const question of currentQuestions) {
      const userAnswer = currentAnswers[question.id] || [];
      userAnswers.push(userAnswer);

      const isCorrect =
        userAnswer.length === question.correctAnswers.length &&
        userAnswer.every((a) => question.correctAnswers.includes(a)) &&
        question.correctAnswers.every((a) => userAnswer.includes(a));

      if (isCorrect) correctCount++;
    }

    const percentage = Math.round((correctCount / currentQuestions.length) * 100);

    const attempt: any = {
      id: `${Date.now()}-${Math.random()}`,
      testId: currentTest!.id,
      testTitle: currentTest!.title,
      date: new Date().toISOString(),
      correctCount,
      totalQuestions: currentQuestions.length,
      percentage,
      answers: userAnswers,
    };

    if (currentTicket) {
      attempt.ticketId = currentTicket.id;
      attempt.ticketTitle = currentTicket.title;
    }

    addAttempt(attempt);
    clearCurrentAnswers();

    Modal.success({
      title: 'Тест завершен!',
      content: (
        <div>
          <p>Правильных ответов: {correctCount} из {currentQuestions.length}</p>
          <p>Результат: {percentage}%</p>
          <p>Время: {formatTime(3600 - timeLeft)}</p>
        </div>
      ),
      okText: 'К результатам',
      onOk: () => navigate('/results'),
    });

    setSubmitting(false);
  };

  const getDeclension = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'а';
    return 'ов';
  };

  // Если тест с билетами и билет не выбран — показываем список билетов
  if (currentTest && currentTest.hasTickets && !ticketId) {
    return (
      <div className="test-page">
        <Header />
        <div className="test-content">
          <div className="test-header">
            <Title level={3}>{currentTest.title}</Title>
            <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
              {currentTest.description}
            </Typography.Paragraph>
          </div>
          <TicketList testId={currentTest.id} tickets={currentTest.tickets || []} />
        </div>
      </div>
    );
  }

  // Если тест без билетов и не загружен — лоадер
  if (!currentTest || (!currentTest.hasTickets && !currentQuestions.length)) {
    return (
      <div className="test-page">
        <Header />
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  // Если тест с билетами, но билет не загружен
  if (currentTest.hasTickets && !currentTicket) {
    return (
      <div className="test-page">
        <Header />
        <div className="loading">Загрузка билета...</div>
      </div>
    );
  }

  const answeredCount = Object.keys(currentAnswers).length;
  const progress = Math.round((answeredCount / currentQuestions.length) * 100);
  const displayTitle = currentTicket ? `${currentTest.title} — ${currentTicket.title}` : currentTest.title;

  return (
    <div className="test-page">
      <Header />
      <div className="test-content">
        <div className="test-header">
          <Title level={3}>{displayTitle}</Title>
          <Row gutter={[16, 16]} className="test-stats" justify="center">
            <Col xs={12} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Прогресс"
                  value={progress}
                  suffix="%"
                  valueStyle={{ color: '#00a8ff', fontSize: 'clamp(20px, 4vw, 32px)' }}
                />
                <Progress percent={progress} size="small" showInfo={false} />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card className="stat-card timer-card">
                <Statistic
                  title="Осталось времени"
                  value={formatTime(timeLeft)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ 
                    color: timeLeft < 300 ? '#ff4d4f' : '#52c41a',
                    fontSize: 'clamp(16px, 3.5vw, 24px)',
                    fontFamily: 'monospace'
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Отвечено вопросов"
                  value={`${answeredCount}/${currentQuestions.length}`}
                />
              </Card>
            </Col>
          </Row>
        </div>

        <div className="questions-section">
          {paginatedQuestions.map((question) => (
            <QuestionBlock
              key={question.id}
              id={question.id}
              text={question.text}
              type={question.type}
              options={question.options}
              selectedAnswers={currentAnswers[question.id] || []}
              onAnswerChange={(selected) => handleAnswerChange(question.id, selected)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            current={currentPage}
            total={currentQuestions.length}
            pageSize={PAGE_SIZE}
            onChange={setCurrentPage}
          />
        )}

        <div className="submit-section">
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleSubmit}
            loading={submitting}
          >
            Завершить тест
          </Button>
        </div>
      </div>
    </div>
  );
}