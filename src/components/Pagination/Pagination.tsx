// src/components/Pagination/Pagination.tsx
import { Pagination as AntPagination } from 'antd';
import './Pagination.scss';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, pageSize, onChange }: PaginationProps) {
  return (
    <div className="pagination-wrapper">
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger={false}
        showQuickJumper
      />
    </div>
  );
}