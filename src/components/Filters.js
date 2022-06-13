import React, { Fragment } from "react";
import { Input, Select, Icon, Button } from "antd";
import { connect } from "react-redux";
import _ from "lodash";
import { setFilter, setKey, bulkUpdate } from "../store/actions";
import SelectCollection from "./SelectCollection";
import config from "../config";
import { useObject } from "@codedrops/lib";
import {
  getStatusOptions,
  SOCIAL_STATUS_OPTIONS,
  POST_TYPE_OPTIONS,
  SORT_OPTIONS,
  VISIBILITY_OPTIONS,
  RATING_OPTIONS,
} from "../constants";

const { Search } = Input;
const { Option } = Select;

const RESET_FILTER = {
  tags: undefined,
  socialStatus: undefined,
  status: ["QUICK_ADD", "DRAFT"],
  search: undefined,
  rating: undefined,
  type: undefined,
  visible: true,
  sortOrder: "DESC",
  sortFilter: "index",
};

const validateFilters = ({
  socialStatus,
  status,
  search,
  tags = [],
  sortFilter,
  rating,
  type,
} = {}) =>
  socialStatus ||
  status ||
  search ||
  tags.length ||
  sortFilter !== "createdAt" ||
  rating ||
  type;

const StatusDropdown = (props) => (
  <Select allowClear className="form-field" placeholder="Status" {...props}>
    {getStatusOptions(props).map(({ label, value }) => (
      <Option key={value} value={value}>
        {label}
      </Option>
    ))}
  </Select>
);

const VisibilityDropdown = (props) => (
  <Select allowClear className="form-field" placeholder="Visibility" {...props}>
    {VISIBILITY_OPTIONS.map(({ label, value }) => (
      <Option key={value} value={value}>
        {label}
      </Option>
    ))}
  </Select>
);

const Filters = ({
  dispatch,
  filters,
  notes,
  meta,
  activeCollectionId,
  settings,
  displayType,
  showAllFilters,
  hasSelectedItems,
}) => {
  const setFilterValues = (filter) => {
    const props = Object.entries(filter);
    let extraFilters = {};
    if (props.length === 1) {
      const [key, value] = props[0];
      if (key === "status" && value.length === 1 && _.includes(value, "POSTED"))
        extraFilters = { sortFilter: "liveId", sortOrder: "DESC" };
      else if (key === "status")
        extraFilters = { sortFilter: "createdAt", sortOrder: "DESC" };
    }
    dispatch(setFilter({ ...filter, ...extraFilters }));
  };

  const { tags = [] } = settings;

  const ActiveCollection = (
    <SelectCollection resetFilters={true} value={activeCollectionId} />
  );

  const SearchBox = (
    <Search
      allowClear
      style={{ width: "120px" }}
      className="form-field"
      placeholder="Search..."
      defaultValue={filters?.search}
      onSearch={(value) => setFilterValues({ search: value })}
    />
  );

  const Tags = (
    <Select
      allowClear
      style={{ minWidth: "100px", width: "auto" }}
      className="form-field"
      mode="multiple"
      placeholder="Tags"
      value={filters.tags}
      onChange={(values) => setFilterValues({ tags: values })}
    >
      {tags.map(({ label }) => (
        <Option key={label} value={label}>
          {label}
        </Option>
      ))}
    </Select>
  );

  const PostType = (
    <Select
      allowClear
      className="form-field"
      style={{ width: "76px" }}
      placeholder="Type"
      value={filters.type}
      onChange={(value) => setFilterValues({ type: value })}
    >
      {POST_TYPE_OPTIONS.map(({ label, value }) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  );

  const Ratings = (
    <Select
      allowClear
      className="form-field"
      style={{ width: "90px" }}
      placeholder="Rating"
      value={filters.rating}
      onChange={(value) => setFilterValues({ rating: value })}
    >
      {RATING_OPTIONS.map(({ label, value }) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  );

  const Status = (
    <StatusDropdown
      value={filters.status}
      mode="multiple"
      style={{ minWidth: "100px", width: "auto" }}
      onChange={(value) => setFilterValues({ status: value })}
      settings={settings}
    />
  );

  const SocialStatus = (
    <Select
      allowClear
      className="form-field"
      placeholder="Social Status"
      value={filters.socialStatus}
      onChange={(value) => setFilterValues({ socialStatus: value })}
    >
      {SOCIAL_STATUS_OPTIONS.map(({ label, value }) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  );

  const SortBy = (
    <Select
      allowClear
      className="form-field"
      placeholder="Sort"
      value={filters.sortFilter}
      onChange={(value) => setFilterValues({ sortFilter: value })}
    >
      {SORT_OPTIONS.map(({ label, value }) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  );

  const Visibility = (
    <VisibilityDropdown
      value={filters.visible}
      onChange={(value) => setFilterValues({ visible: value })}
    />
  );

  const menuList = [
    {
      id: "ActiveCollection",
      component: ActiveCollection,
      visible: true,
      showInMinimized: true,
    },
    {
      id: "SearchBox",
      component: SearchBox,
      visible: true,
      showInMinimized: true,
    },
    {
      id: "Status",
      component: Status,
      visible: true,
      showInMinimized: true,
    },
    {
      id: "PostType",
      component: PostType,
      visible: true,
      showInMinimized: false,
    },
    {
      id: "Tags",
      component: Tags,
      visible: !_.isEmpty(tags),
      showInMinimized: false,
    },
    {
      id: "Ratings",
      component: Ratings,
      visible: true,
      showInMinimized: false,
    },
    {
      id: "SocialStatus",
      component: SocialStatus,
      visible: false,
      showInMinimized: false,
    },
    {
      id: "Visibility",
      component: Visibility,
      visible: true,
      showInMinimized: false,
    },
    {
      id: "SortBy",
      component: SortBy,
      visible: true,
      showInMinimized: true,
    },
  ];

  return (
    <div className="flex center wrap gap-2">
      {menuList
        .filter((item) =>
          item.visible && showAllFilters ? true : item.showInMinimized
        )
        .map((item) => (
          <Fragment key={item.id}>{item.component}</Fragment>
        ))}

      {!!validateFilters(filters) && (
        <Icon
          className="icon icon-bg"
          type="close"
          onClick={() =>
            setFilterValues({
              ...RESET_FILTER,
              ...(settings?.defaultFilters || {}),
            })
          }
        />
      )}

      <Icon
        className="icon icon-bg"
        onClick={() =>
          setFilterValues({
            sortOrder: filters.sortOrder === "ASC" ? "DESC" : "ASC",
          })
        }
        type={
          filters.sortOrder === "ASC" ? "sort-ascending" : "sort-descending"
        }
      />

      <Icon
        className="icon icon-bg"
        type={displayType === "CARD" ? "table" : "border"}
        onClick={() =>
          dispatch(
            setKey({ displayType: displayType === "CARD" ? "TABLE" : "CARD" })
          )
        }
      />

      <Icon
        type={"reload"}
        className="icon icon-bg"
        onClick={() => dispatch(setFilter())}
      />

      {_.get(meta, "count", 0) > 0 && (
        <span className="showing-count">
          {displayType === "CARD"
            ? `${notes.length}/${meta.count}`
            : `${filters.page}/${Math.ceil(meta.count / config.LIMIT)}`}
        </span>
      )}
      <Icon
        type={showAllFilters ? "double-left" : "double-right"}
        className="icon icon-bg"
        onClick={() => dispatch(setKey({ showAllFilters: !showAllFilters }))}
      />
    </div>
  );
};

const Actions = ({ selectedItems, dispatch }) => {
  const [data, setData] = useObject();

  const totalSelectedItems = `${selectedItems.length} items selected`;
  const showUpdateButton = Object.entries(data).length > 0;

  const handleUpdate = () => {
    const input = {
      ids: selectedItems,
      ...data,
    };
    dispatch(bulkUpdate(input));
  };

  const clearSelection = () => dispatch(setKey({ selectedItems: [] }));

  return (
    <div className="flex center space-between gap-2">
      <StatusDropdown
        value={data.status}
        onChange={(value) => setData({ status: value })}
      />
      <VisibilityDropdown
        value={data.visible}
        onChange={(value) => setData({ visible: value })}
      />
      {showUpdateButton && (
        <Button onClick={handleUpdate} type="primary">
          Update
        </Button>
      )}
      <Icon className="icon icon-bg" type="close" onClick={clearSelection} />
      <Icon
        type={"reload"}
        className="icon icon-bg"
        onClick={() => dispatch(setFilter())}
      />
      <span className="showing-count">{totalSelectedItems}</span>
    </div>
  );
};

const FiltersWrapper = (props) => {
  const { hasSelectedItems } = props;
  return hasSelectedItems ? <Actions {...props} /> : <Filters {...props} />;
};

const mapStateToProps = ({
  filters,
  notes,
  meta,
  activeCollectionId,
  settings,
  displayType,
  showAllFilters,
  selectedItems,
}) => ({
  filters,
  notes,
  meta,
  activeCollectionId,
  settings,
  displayType,
  showAllFilters,
  selectedItems,
  hasSelectedItems: _.size(selectedItems) > 0,
});

export default connect(mapStateToProps)(FiltersWrapper);
