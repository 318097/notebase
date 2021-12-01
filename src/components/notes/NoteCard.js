import React, { useState } from "react";
import styled from "styled-components";
import { Icon as AntIcon } from "antd";
import moment from "moment";
import colors, { Card, Icon, Tag } from "@codedrops/react-ui";
import _ from "lodash";
import classnames from "classnames";
// import Dropdown from "../lib/Dropdown";
import { md } from "../../lib/utils";

const StyledCard = styled.div`
  height: 300px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  /* break-inside: avoid-column; */
  .card,
  .action-row {
    border: 1px solid ${colors.bg};
    box-shadow: ${colors.bg} 3px 3px 3px;
    position: relative;
    width: 100%;
    min-height: unset;
    overflow: visible;
    &:hover {
      background: ${colors.featherDark};
    }
  }
  .card {
    flex: 1 1 auto;
    overflow: hidden;
    margin: 0 0 2px 0;
    cursor: pointer;
    font-size: 1rem;
    padding: 24px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
      font-size: 1.2rem;
      text-align: center;
    }
    .post-title {
      font-size: 1.6rem;
    }
    .content {
      font-size: inherit;
      width: 100%;
      margin-top: 8px;
      overflow-x: auto;
      padding: 0;
      pre,
      code {
        font-size: 1rem;
      }
    }
  }
  .card.today,
  .action-row.today {
    background: ${colors.feather};
  }
  .action-row {
    padding: 6px;
    top: 0px;
    flex: 0 0 auto;
    &:hover {
      background: ${colors.white};
    }
    .status-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .status-tag {
        text-transform: capitalize;
      }
      .anticon {
        margin: 0 2px;
      }
    }
  }
`;

const NoteCard = ({ note, handleClick, onEdit, onDelete, tagsCodes }) => {
  const {
    title = "",
    content = "",
    type = "DROP",
    tags = [],
    _id,
    status,
    visible,
    index,
    liveId,
    createdAt,
    rating,
    chainedPosts = [],
    chainedItems = [],
    chainedTo = [],
  } = note;
  // const [showDropdown, setShowDropdown] = useState(false);
  const isCreatedToday = moment().isSame(moment(createdAt), "day");
  const createdTimeAgo = moment(createdAt).fromNow();
  const postStatus =
    status === "POSTED"
      ? `Live Id: ${liveId}`
      : status.replace("_", " ").toLowerCase();

  const cardClasses = classnames("card", { today: !!isCreatedToday });
  const titleClasses = classnames("title", {
    "post-title": type !== "DROP",
  });
  return (
    <StyledCard>
      <Card onClick={(e) => handleClick(e, _id)} className={cardClasses}>
        <h3
          className={titleClasses}
          dangerouslySetInnerHTML={{ __html: md.renderInline(title) }}
        />

        {["DROP", "QUIZ"].includes(type) && (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: md.render(content) }}
          ></div>
        )}
        {!!index && (
          <div className="index-wrapper">
            <span className="index">{`#${index}`}</span>
          </div>
        )}
        {/* <Dropdown
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          onEdit={() => onEdit(_id)}
          onDelete={() => onDelete(_id)}
        /> */}
      </Card>
      <Card className={classnames("action-row", { today: !!isCreatedToday })}>
        <div className="status-row">
          <div className="tags">
            {tags.map((tag) => (
              <Tag key={tag} color={tagsCodes[tag]}>
                {tag}
              </Tag>
            ))}
          </div>

          <Tag
            className="status-tag"
            color={status === "POSTED" ? "cdGreen" : "watermelon"}
          >
            {postStatus}
          </Tag>
        </div>

        <div className="status-row">
          <div className="flex center">
            {!!rating && (
              <Tag>
                {rating}
                <AntIcon
                  type="star"
                  style={{
                    fontSize: "12px",
                  }}
                />
              </Tag>
            )}

            {type === "CHAIN" ? (
              <Tag
                color={
                  chainedItems.length !== chainedPosts.length ? "red" : "steel"
                }
              >{`${chainedItems.length} posts`}</Tag>
            ) : !_.isEmpty(chainedTo) ? (
              <Tag>{`In ${chainedTo.length} chains`}</Tag>
            ) : null}

            {!visible && <AntIcon type="eye-invisible" />}
            {type === "DROP" ? (
              <Icon type="bulb" size={12} />
            ) : type === "CHAIN" ? (
              <AntIcon type="deployment-unit" size={12} />
            ) : null}
          </div>

          <Tag>{createdTimeAgo}</Tag>
        </div>
      </Card>
    </StyledCard>
  );
};

export default NoteCard;
