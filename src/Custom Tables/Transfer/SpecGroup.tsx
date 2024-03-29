import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SpecGroupProps } from "./Types";
import React, { useMemo, useState, useRef, useEffect } from "react";
import SortableItem from "./SortableItem";
import { Row, Space, Typography, Button, Image, Input, Popconfirm } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

const { Text } = Typography;

const SpecGroup = ({
  allTasks,
  droppedTasks,
  count,
  selectRightContainer,
  columnId,
  isTableEdited,
  setIsTableEdited,
  handleSelect,
  selectedTasks,
  setTasks,
  specGroups,
  setSpecGroups,
  isTranferingRight,
  isAllGroupsCollapsed,
  updateTaskColumnIds,
}: SpecGroupProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [deleteInitiated, setDeleteInitiated] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [editedTitle, setEditedTitle] = useState(columnId);
  const currentSpecGroup = useMemo(
    () => specGroups?.find((group) => group.name === columnId),
    [specGroups, columnId]
  );
  const [isEdited, setIsEdited] = useState(currentSpecGroup.isEdited);

  console.log(droppedTasks);

  const inputRef = useRef<Input>(null);
  const { setNodeRef } = useSortable({
    id: columnId,
    data: {
      type: "Column",
      columnId,
    },
  });

  const tasksIds = useMemo(
    () => droppedTasks?.map((task) => task.id),
    [droppedTasks]
  );

  useEffect(() => {
    if (currentSpecGroup) {
      setIsEdited(currentSpecGroup.isEdited);
    }
  }, [currentSpecGroup]);

  useEffect(() => {
    setIsCollapsed(isAllGroupsCollapsed);
  }, [isAllGroupsCollapsed]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setIsEmpty(droppedTasks.length === 0);
    setFilterCount(droppedTasks.length);
  }, [droppedTasks]);

  useEffect(() => {
    setEditedTitle(columnId);
  }, [specGroups]);

  const handleEditClick = () => setIsEditing(!isEditing);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditedTitle(e.target.value);

  const handleToggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const newTitle =
        editedTitle.trim() !== "" ? editedTitle.trim() : columnId;

      setIsEditing(false);

      if (newTitle !== columnId) {
        updateColumnIdAndTitle(columnId, newTitle);
        setIsEdited(true);
        setIsTableEdited(true);
      } else {
        setEditedTitle(columnId);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(columnId);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!deleteInitiated) {
        setIsEditing(false);

        const newTitle =
          editedTitle.trim() !== "" ? editedTitle.trim() : columnId;

        if (newTitle !== columnId) {
          updateColumnIdAndTitle(columnId, newTitle);
          setIsEdited(true);
          setIsTableEdited(true);
        } else {
          setEditedTitle(columnId);
        }
      }
      setDeleteInitiated(false);
    }, 100);
  };

  const handleDeleteInitiation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDeleteInitiated(true);
  };

  const handleDelete = () => {
    // Filter out the spec group that matches the editedTitle (assuming editedTitle is the name of the spec group to delete)
    const updatedSpecGroups = specGroups.filter(
      (group) => group.name !== editedTitle
    );

    // Update tasks associated with the deleted group
    const updatedTasks = allTasks
      .filter((task) => task.columnId !== editedTitle) // Keep tasks not in the deleted group
      .concat(
        allTasks
          .filter((task) => task.columnId === editedTitle) // Find tasks in the deleted group
          .map((task) => ({
            ...task,
            columnId: "right",
            hidden: false,
            edited: true,
          })) // Assign them to "right" column and make visible
      );

    setSpecGroups(updatedSpecGroups);
    setTasks(updatedTasks);
    setIsEditing(false);
  };

  const updateColumnIdAndTitle = (oldTitle: string, newTitle: string) => {
    // Update the specGroups to reflect the new name and set isEdited to true for the updated group
    setSpecGroups((prevSpecGroups) =>
      prevSpecGroups.map((group) =>
        group.name === oldTitle
          ? { ...group, name: newTitle, isEdited: true }
          : group
      )
    );

    // Update tasks' columnId to the newTitle where it matches oldTitle
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.columnId === oldTitle ? { ...task, columnId: newTitle } : task
      )
    );

    setEditedTitle(newTitle);
    setIsTableEdited(true);
  };

  let className = "spec-groups";

  if (isEdited) {
    className += " spec-group-draft";
  }
  if (isTranferingRight) {
    className += " spec-group-hover select-container";
  }

  return (
    <div
      ref={setNodeRef}
      className={className}
      onClick={() => selectRightContainer(columnId)}
    >
      <Space style={{ rowGap: 0 }} direction="vertical" className="w-full">
        <Row justify="space-between" className="spec-groups__title-container">
          <Space size={24}>
            <Image
              src="https://www.webstaurantstore.com/uploads/images/2024/3/draggableicon.png"
              alt="Draggable Icon"
              width={18}
              height={18}
              className="spec-groups__draggable-icon"
              preview={false}
            />
            <Space>
              <span
                className="spec-groups__arrow"
                onClick={handleToggleCollapse}
              >
                {isCollapsed ? <RightOutlined /> : <DownOutlined />}
              </span>
              {isEditing ? (
                <Input
                  autoFocus
                  type="text"
                  value={editedTitle}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onBlur={handleInputBlur}
                  ref={inputRef}
                  className="spec-groups__title-input"
                />
              ) : (
                <Text
                  className="spec-groups__title"
                  onClick={() => setIsCollapsed((prev) => !prev)}
                  strong
                >
                  {editedTitle}
                </Text>
              )}
            </Space>
          </Space>
          <Space>
            {isEditing ? (
              <Popconfirm
                placement="topRight"
                title={
                  "Deleting this spec group will move any filters under it, out and to the bottom of the order list. Are you sure you want to delete?"
                }
                okText="Delete Spec Group"
                okType="danger"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setIsEditing(false)}
              >
                <Button type="link" onMouseDown={handleDeleteInitiation}>
                  Delete
                </Button>
              </Popconfirm>
            ) : (
              <Button type="link" onClick={handleEditClick}>
                Edit
              </Button>
            )}
            <Text className="spec-groups__pipe">|</Text>
            <Text>{filterCount} Filters</Text>
          </Space>
        </Row>

        <Row
          justify="center"
          className={
            isCollapsed ? "spec-groups__footer hidden" : "spec-groups__footer"
          }
        >
          <Space className="w-full" direction="vertical">
            <SortableContext strategy={rectSortingStrategy} items={tasksIds}>
              {droppedTasks.map((task) =>
                !task.hidden ? (
                  <SortableItem
                    onSelect={(e) => handleSelect(task.id.toString())}
                    selected={selectedTasks.includes(task.id.toString())}
                    id={task.id.toString()}
                    key={task.id}
                    task={task}
                    count={count}
                    isTableEdited={isTableEdited}
                    isOnLeftSide={columnId === "left"}
                  />
                ) : null
              )}
            </SortableContext>
            {isEmpty && <Text>Drag/drop or move filters.</Text>}
          </Space>
        </Row>
      </Space>
    </div>
  );
};

export default SpecGroup;
