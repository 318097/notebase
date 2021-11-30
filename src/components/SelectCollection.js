import React from "react";
import { connect } from "react-redux";
import { Select } from "antd";
import _ from "lodash";
import { setActiveCollection } from "../store/actions";

const { Option } = Select;

const SelectCollection = ({
  collection,
  session,
  setActiveCollection,
  setCollection,
  style = {},
  resetFilter,
  setFilterValues,
}) => {
  const handleChange = (_id) => {
    setCollection ? setCollection(_id) : setActiveCollection(_id);
    if (resetFilter) setFilterValues();
  };

  return (
    <Select
      onChange={handleChange}
      style={{ width: 120, ...style }}
      placeholder="Collections"
      value={collection}
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
