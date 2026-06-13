import { Button, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.scss';

const { Title } = Typography;

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.pathname !== '/';

  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="back-btn"
            />
          )}
        </div>
        
        <Title level={3} className="header-title">
          📝 Тестовая система
        </Title>
        
        <div className="header-right">
          <Button
            type="text"
            icon={<BarChartOutlined />}
            onClick={() => navigate('/results')}
            className="results-btn"
          >
            <span className="btn-text">Статистика</span>
          </Button>
          {location.pathname !== '/' && (
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              className="home-btn"
            />
          )}
        </div>
      </div>
    </div>
  );
}