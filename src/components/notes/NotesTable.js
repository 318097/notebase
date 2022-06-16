import React from "react";

import { Table, Tag, Pagination, Badge } from "antd";
import _ from "lodash";
import { setFilter } from "../../store/actions";
import moment from "moment";
import Tags from "./Tags";

const getCustomColumns = ({ customColumns }) => {
  return _.map(customColumns, (column) => {
    switch (column) {
      case "URL":
        return {
          title: "URL",
          dataIndex: "url",
          width: 300,
          render: (url) => {
            return (
              <a
                onClick={(e) => e.stopPropagation(e)}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "90%" }}
              >
                {url}
              </a>
            );
          },
        };
      default:
        return null;
    }
  });
};

const NotesTable = ({
  notes,
  handleClick,
  onEdit,
  onDelete,
  meta,
  dispatch,
  filters,
  scrollRef,
  pageSize,
  settings,
}) => {
  const onPageChange = (page) => {
    dispatch(setFilter({ page }, false));
    scrollRef.current.scrollTop = 0;
  };

  const customColumns = _.get(settings, "customColumns", []);

  const columns = [
    {
      title: "Index",
      dataIndex: "index",
      width: 70,
    },
    {
      title: "Title",
      dataIndex: "title",
      width: 340,
      // fixed: "left",
      render: (title, row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {title}&nbsp;
          {row.status === "POSTED" && <Badge status="success" />}
        </div>
      ),
    },
    ...getCustomColumns({ customColumns }),
    {
      title: "Tags",
      dataIndex: "tags",
      align: "center",
      width: 150,
      render: (tags) => <Tags tags={tags} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 80,
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      align: "center",
      width: 100,
      render: (createdAt) => {
        const addedDays = moment().diff(moment(createdAt), "days");
        return <Tag>{addedDays ? `${addedDays}d ago` : "Today"}</Tag>;
      },
    },
  ];

  return (
    <div
      style={{
        margin: "0 28px 10px",
        background: "white",
      }}
    >
      <Table
        size="medium"
        columns={columns}
        dataSource={notes}
        onRow={(record) => ({
          onClick: (e) => handleClick(e, record._id),
        })}
        pagination={false}
        rowClassName="table-row"
        scroll={{ x: "1000" }}
      />
      <br />
      <Pagination
        current={filters.page}
        onChange={onPageChange}
        size="small"
        total={meta.count}
        pageSize={pageSize}
      />
    </div>
  );
};

export default NotesTable;
