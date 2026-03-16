import React from "react";
import { Pagination } from "antd";
import "antd/dist/reset.css";
import "./CustomPagination.scss";

interface CustomPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
}) => (
  <Pagination
    current={current}
    pageSize={pageSize}
    total={total}
    onChange={onChange}
    style={{ margin: "32px 0 0 0", textAlign: "center" }}
    showSizeChanger={false}
  />
);

export default CustomPagination; 