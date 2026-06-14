import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Tag, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Header } from '../../components/Header/Header';
import { useTestStore } from '../../app/store/testStore';
import type { Attempt, Test, Question } from '../../app/store/testStore';
import { useState, useEffect } from 'react';
import './ResultDetail.scss';

const { Title, Text, Paragraph } = Typography;

interface QuestionDetail {
    id: number;
    text: string;
    type: 'single' | 'multiple';
    options: string[];
    userAnswers: number[];
    correctAnswers: number[];
    isCorrect: boolean;
}

export function ResultDetail() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { attempts, tests } = useTestStore();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [questionsDetail, setQuestionsDetail] = useState<QuestionDetail[]>([]);

    useEffect(() => {
        if (!attemptId) {
            message.error('ID попытки не найден');
            navigate('/results');
            return;
        }

        const foundAttempt = attempts.find((a) => a.id === attemptId);
        if (!foundAttempt) {
            message.error('Попытка не найдена');
            navigate('/results');
            return;
        }

        setAttempt(foundAttempt);

        const foundTest = tests.find((t) => t.id === foundAttempt.testId);
        if (!foundTest) {
            message.error('Тест не найден');
            return;
        }

        setTest(foundTest);

        let questions: Question[] = [];

        if (foundTest.hasTickets && foundAttempt.ticketId) {
            const ticket = foundTest.tickets?.find((t) => t.id === foundAttempt.ticketId);
            if (ticket) {
                questions = ticket.questions;
            }
        } else if (foundTest.questions) {
            questions = foundTest.questions;
        }

        const details: QuestionDetail[] = questions.map((q, idx) => {
            const userAnswer = foundAttempt.answers[idx] || [];

            const isCorrect =
                userAnswer.length === q.correctAnswers.length &&
                userAnswer.every((a) => q.correctAnswers.includes(a)) &&
                q.correctAnswers.every((a) => userAnswer.includes(a));

            return {
                id: q.id,
                text: q.text,
                type: q.type,
                options: q.options,
                userAnswers: userAnswer,
                correctAnswers: q.correctAnswers,
                isCorrect,
            };
        });

        setQuestionsDetail(details);
    }, [attemptId, attempts, tests, navigate]);

    // const formatAnswerNumber = (index: number): string => {
    //     return String.fromCharCode(65 + index);
    // };

    // const formatAnswersWithNumbers = (indices: number[], options: string[]): string => {
    //     if (!indices.length) return 'Не выбран';
    //     return indices.map((i) => `${formatAnswerNumber(i)}. ${options[i]}`).join(' | ');
    // };

    // const formatAnswersNumbersOnly = (indices: number[]): string => {
    //     if (!indices.length) return 'Не выбран';
    //     return indices.map((i) => formatAnswerNumber(i)).join(', ');
    // };

    if (!attempt || !test) {
        return (
            <div className="result-detail-page">
                <Header />
                <div className="result-detail-loading">Загрузка...</div>
            </div>
        );
    }

    const scoreColor = attempt.percentage >= 70 ? '#52c41a' : attempt.percentage >= 50 ? '#faad14' : '#ff4d4f';

    return (
        <div className="result-detail-page">
            <Header />
            <div className="result-detail-content">
                <div className="result-detail-header">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/results')}
                        className="back-btn"
                    >
                        Назад к статистике
                    </Button>
                    <Title level={2}>Разбор результатов</Title>
                </div>

                <Card className="attempt-info-card">
                    <div className="attempt-info-header">
                        <div>
                            <Title level={4}>{attempt.testTitle}</Title>
                            {attempt.ticketTitle && <Tag color="orange">{attempt.ticketTitle}</Tag>}
                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                Дата: {new Date(attempt.date).toLocaleString('ru-RU')}
                            </Text>
                        </div>
                        <div className="attempt-score">
                            <div className="score-circle" style={{ borderColor: scoreColor }}>
                                <span className="score-percent">{attempt.percentage}%</span>
                                <span className="score-count">
                                    {attempt.correctCount} / {attempt.totalQuestions}
                                </span>
                            </div>
                            <Tag color={attempt.percentage >= 70 ? 'green' : 'red'}>
                                {attempt.percentage >= 70 ? 'Сдан' : 'Не сдан'}
                            </Tag>
                        </div>
                    </div>
                </Card>

                <div className="questions-list">
                    <Title level={4}>Вопросы и ответы</Title>
                    {questionsDetail.map((q, idx) => (
                        <Card
                            key={q.id}
                            className={`question-detail-card ${q.isCorrect ? 'correct' : 'incorrect'}`}
                        >
                            <div className="question-header">
                                <div className="question-number">
                                    <span className="num">Вопрос {idx + 1}</span>
                                    {q.isCorrect ? (
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    ) : (
                                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                    )}
                                </div>
                                <Tag color={q.type === 'single' ? 'blue' : 'purple'}>
                                    {q.type === 'single' ? 'Одиночный выбор' : 'Множественный выбор'}
                                </Tag>
                            </div>

                            <Paragraph className="question-text">{q.text}</Paragraph>

                            <div className="answers-section">
                                <div className="all-options">
                                    <Text strong>Все варианты:</Text>
                                    <div className="options-list">
                                        {q.options.map((opt, optIdx) => {
                                            const isUserSelected = q.userAnswers.includes(optIdx);
                                            const isCorrect = q.correctAnswers.includes(optIdx);
                                            let className = '';
                                            if (isCorrect) className = 'option-correct';
                                            if (isUserSelected && !isCorrect) className = 'option-wrong';
                                            if (isUserSelected && isCorrect) className = 'option-correct-selected';

                                            // Номера ответов в цифрах (индекс + 1)
                                            const userAnswerNumbers = q.userAnswers.map(i => i + 1).join(', ');
                                            const correctAnswerNumbers = q.correctAnswers.map(i => i + 1).join(', ');

                                            return (
                                                <div key={optIdx} className={`option-item ${className}`}>
                                                    <span className="option-letter">{optIdx + 1}</span>
                                                    <span className="option-text">{opt}</span>
                                                    <div className="option-tags">
                                                        {isUserSelected && (
                                                            <Tag className="option-tag">
                                                                Ваш выбор ({userAnswerNumbers})
                                                            </Tag>
                                                        )}
                                                        {isCorrect && (
                                                            <Tag color="green" className="option-tag">
                                                                Правильный ({correctAnswerNumbers})
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="result-detail-footer">
                    <Button type="primary" onClick={() => navigate('/results')}>
                        К статистике
                    </Button>
                    <Button onClick={() => navigate('/')}>На главную</Button>
                </div>
            </div>
        </div>
    );
}