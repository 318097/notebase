import React, { Fragment } from "react";

import { Table, Tag, Pagination, Badge } from "antd";
import _ from "lodash";
import { setFilter } from "../../store/actions";
import moment from "moment";

const getCustomColumns = ({ customColumns }) => {
  return _.map(customColumns, (column) => {
    switch (column) {
      case "URL":
        return {
          title: "URL",
          key: "url",
          dataIndex: "url",
          width: "300px",
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
  tagsCodes,
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
      title: "Id",
      dataIndex: "index",
      key: "index",
      width: "50px",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "40%",
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
      key: "tags",
      align: "center",
      width: "150px",
      render: (tags) => (
        <Fragment>
          {tags.map((tag) => (
            <Tag
              key={tag}
              color={tagsCodes[tag]}
              style={{ marginBottom: "4px" }}
            >
              {tag}
            </Tag>
          ))}
        </Fragment>
      ),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      align: "center",
    },
    {
      title: "Created",
      key: "createdAt",
      dataIndex: "createdAt",
      align: "center",
      render: (createdAt) => {
        const addedDays = moment().diff(moment(createdAt), "days");
        return <Tag>{addedDays ? `${addedDays}d ago` : "Today"}</Tag>;
      },
    },
  ];

  return (
    <div
      style={{
        width: "90%",
        margin: "0 auto",
        background: "white",
        paddingBottom: "10px",
      }}
    >
      <Table
        size="middle"
        tableLayout="fixed"
        columns={columns}
        dataSource={notes}
        onRow={(record) => ({
          onClick: (e) => handleClick(e, record._id),
        })}
        pagination={false}
        rowClassName="table-row"
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
