import { Card, Button, Typography, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from '../../app/store/testStore';
import './TicketList.scss';

const { Title } = Typography;

interface TicketListProps {
  testId: string;
  tickets: Ticket[];
}

export function TicketList({ testId, tickets }: TicketListProps) {
  const navigate = useNavigate();

  const handleSelectTicket = (ticketId: string) => {
    navigate(`/test/${testId}/ticket/${ticketId}`);
  };


  console.log(tickets, 'tickets')

  return (
    <div className="ticket-list">
      <Title level={4} className="ticket-list-title">
        Выберите билет
      </Title>
      <div className="tickets-grid">
        {tickets.map((ticket, index) => (
          <Card
            key={ticket.id}
            className="ticket-card"
            hoverable
            onClick={() => handleSelectTicket(ticket.id)}
          >
            <div className="ticket-card-content">
              <div className="ticket-number">
                {ticket.title || `Билет ${index + 1}`}
              </div>
              <Tag color="blue">{ticket.questions.length} вопросов</Tag>
              <Button type="primary" size="small" className="ticket-btn">
                Выбрать
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}