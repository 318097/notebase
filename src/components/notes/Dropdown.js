import React from "react";
import styled from "styled-components";

const DropdownWrapper = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  .dropdown-icon {
    padding: 2px;
    border-radius: 50%;
  }
  .dropdown {
    display: flex;
    flex-direction: column;
    position: absolute;
    padding: 5px;
    right: -3px;
    top: 19px;
    border-radius: 15px;
    & > * {
      margin: 2px 0;
    }
  }
`;

const Dropdown = ({ showDropdown }) => {
  const handleEdit = () => {
    setNoteToEdit(_id);
    setShowDropdown(false);
  };

  const handleDelete = () => {
    deleteNote(_id);
    setShowDropdown(false);
  };

  const handleDropdownClick = event => {
    event.stopPropagation();
    setShowDropdown(prevState => !prevState);
  };

  return (
    <DropdownWrapper className="dropdown-wrapper">
      <Icon
        className="dropdown-icon"
        type="more"
        onClick={handleDropdownClick}
      />
      {showDropdown && (
        <div className="dropdown" onClick={event => event.stopPropagation()}>
          <Icon onClick={handleFavorite} type="heart" />
          <Icon onClick={handleEdit} type="edit" />
          <Popconfirm
            title="Delete?"
            onConfirm={handleDelete}
            placement="right"
            okText="Yes"
            cancelText="No"
          >
            <Icon type="delete" />
          </Popconfirm>
        </div>
      )}
    </DropdownWrapper>
  );
};

export default Dropdown;
