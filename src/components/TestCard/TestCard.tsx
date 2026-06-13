import { Card, Button, Typography, Tag } from 'antd';
import { FileTextOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './TestCard.scss';

const { Title, Paragraph } = Typography;

interface TestCardProps {
  id: string;
  title: string;
  description: string;
  hasTickets: boolean;
  ticketsCount?: number;
  questionsCount?: number;
}

export function TestCard({ id, title, description, hasTickets, ticketsCount, questionsCount }: TestCardProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (hasTickets) {
      navigate(`/test/${id}`);
    } else {
      navigate(`/test/${id}/start`);
    }
  };

  return (
    <Card className="test-card" hoverable>
      <div className="test-card-icon">
        {hasTickets ? <ProfileOutlined /> : <FileTextOutlined />}
      </div>
      <Title level={4}>{title}</Title>
      <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
        {description}
      </Paragraph>
      <div className="test-card-footer">
        {hasTickets ? (
          <Tag color="orange">{ticketsCount} билетов</Tag>
        ) : (
          <Tag color="blue">{questionsCount} вопросов</Tag>
        )}
        <Button type="primary" onClick={handleStart}>
          {hasTickets ? 'Выбрать билет' : 'Начать'}
        </Button>
      </div>
    </Card>
  );
}