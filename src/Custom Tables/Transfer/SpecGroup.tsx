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
  select,
  columnId,
  isSaved,
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
  const [editedTitle, setEditedTitle] = useState(columnId);
  const [isEmpty, setIsEmpty] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const { setNodeRef } = useSortable({
    id: columnId,
    data: {
      type: "Column",
      columnId,
    },
  });

  const deleteText =
    "Deleting this spec group will move any filters under it, out and to the bottom of the order list. Are you sure you want to delete?";

  const inputRef = useRef<Input>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    const updatedSpecGroups = specGroups.filter((group) => group !== columnId);

    // Separate the tasks into those that are in the "right" container and those that are not
    const rightContainerTasks = allTasks.filter(
      (task) => task.columnId === "right"
    );
    const otherTasks = allTasks.filter(
      (task) => task.columnId !== columnId && task.columnId !== "right"
    );
    const deletedGroupTasks = allTasks
      .filter((task) => task.columnId === columnId)
      .map((task) => ({ ...task, columnId: "right", hidden: false }));

    // Append the tasks from the deleted group to the end of the "right" container tasks
    const updatedTasks = [
      ...otherTasks,
      ...rightContainerTasks,
      ...deletedGroupTasks,
    ];

    // Update the state with the modified specGroups and tasks
    setIsEditing(false);
    setSpecGroups(updatedSpecGroups);
    setTasks(updatedTasks);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditing(false);
      if (editedTitle.trim() !== "") {
        // Notify the TransferTable component about the columnId change
        updateTaskColumnIds(columnId, editedTitle.trim());

        // Update specGroups list with new editedTitle
        const updatedSpecGroups = specGroups.map((group) =>
          group === columnId ? editedTitle.trim() : group
        );
        setSpecGroups(updatedSpecGroups);
        setEditedTitle(editedTitle.trim());
      }
    }
  };

  const tasksIds = useMemo(() => {
    return droppedTasks.map((task) => task.id);
  }, [droppedTasks]);

  useEffect(() => {
    if (droppedTasks.length === 0) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }

    setFilterCount(droppedTasks.length);
  }, [droppedTasks]);

  useEffect(() => {
    setEditedTitle(columnId);
  }, [specGroups]);

  return (
    <div
      ref={setNodeRef}
      className={
        isTranferingRight ? "spec-groups select-container" : "spec-groups"
      }
      onClick={() => select(columnId)}
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
                onClick={() => setIsCollapsed((prev) => !prev)}
              >
                {isCollapsed || isAllGroupsCollapsed ? (
                  <RightOutlined />
                ) : (
                  <DownOutlined />
                )}
              </span>
              {isEditing ? (
                <Input
                  autoFocus
                  type="text"
                  value={editedTitle}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  on
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
                title={deleteText}
                okText="Delete Spec Group"
                okType="danger"
                cancelText="Cancel"
                onConfirm={handleDelete}
              >
                <Button type="link">Delete</Button>
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
            isCollapsed || isAllGroupsCollapsed
              ? "spec-groups__footer hidden"
              : "spec-groups__footer"
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
                    isSaved={isSaved}
                    isOnLeftSide={columnId === 'left'}
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
