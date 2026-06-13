// src/components/QuestionBlock/QuestionBlock.tsx
import { Card, Checkbox, Radio, Typography, Space } from 'antd';
import './QuestionBlock.scss';

const { Title } = Typography;

interface QuestionBlockProps {
  id: number;
  text: string;
  type: 'single' | 'multiple';
  options: string[];
  selectedAnswers: number[];
  onAnswerChange: (selectedIndexes: number[]) => void;
}

export function QuestionBlock({
  id,
  text,
  type,
  options,
  selectedAnswers,
  onAnswerChange,
}: QuestionBlockProps) {
  const handleSingleChange = (value: number) => {
    onAnswerChange([value]);
  };

  const handleMultipleChange = (checkedValues: number[]) => {
    onAnswerChange(checkedValues);
  };

  return (
    <Card className="question-block" id={`question-${id}`}>
      <Title level={5} className="question-text">
        <span className="question-number">{id}.</span> {text}
      </Title>
      <div className="question-options">
        {type === 'single' ? (
          <Radio.Group
            onChange={(e) => handleSingleChange(e.target.value)}
            value={selectedAnswers[0]}
          >
            <Space direction="vertical">
              {options.map((option, idx) => (
                <Radio key={idx} value={idx}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        ) : (
          <Checkbox.Group
            onChange={handleMultipleChange}
            value={selectedAnswers}
          >
            <Space direction="vertical">
              {options.map((option, idx) => (
                <Checkbox key={idx} value={idx}>
                  {option}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        )}
      </div>
    </Card>
  );
}