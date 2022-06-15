import React from "react";
import { Tag } from "@codedrops/react-ui";
import { connect } from "react-redux";
import { getTagsMap } from "../../lib/utils";
import _ from "lodash";

const Tags = ({ tags = [], tagsMap }) => {
  return tags.map((tag) => {
    const { color, label } = _.get(tagsMap, tag);
    return (
      <Tag key={tag} color={color}>
        {_.capitalize(label)}
      </Tag>
    );
  });
};

const mapStateToProps = ({ settings }) => ({
  tagsMap: getTagsMap(settings),
});

export default connect(mapStateToProps)(Tags);
