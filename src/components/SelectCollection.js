import React from "react";
import { connect } from "react-redux";
import { Select } from "antd";
import _ from "lodash";
import { setActiveCollection } from "../store/actions";

const { Option } = Select;

const SelectCollection = ({
  value,
  session,
  setActiveCollection,
  handleChange,
  style = {},
  resetFilter,
}) => {
  const onChange = (_id) => {
    handleChange ? handleChange(_id) : setActiveCollection(_id);
    if (resetFilter) resetFilter();
  };

  return (
    <Select
      onChange={onChange}
      style={{ width: 120, ...style }}
      placeholder="Collections"
      value={value}
    >
      {_.get(session, "notebase", []).map(({ _id, name }) => (
        <Option key={_id} value={_id}>
          {name}
        </Option>
      ))}
    </Select>
  );
};

const mapStateToProps = ({ session }) => ({
  session,
});

const mapDispatchToProps = {
  setActiveCollection,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectCollection);
