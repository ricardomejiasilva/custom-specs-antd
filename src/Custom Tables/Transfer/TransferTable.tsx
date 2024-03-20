import React, { useEffect, useState } from "react";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button, Space, Col, Row, Typography, Layout } from "antd";
import { Id, Task } from "./Types";
import SpecGroup from "./SpecGroup";
import Item from "./Item";
import { createPortal } from "react-dom";
import { defaultTaks } from "./TaskList";
import "../../styles/custom-spec-table-transfer.less";

const { Text } = Typography;

interface Props {
  specGroups: string[];
  setSpecGroups: (specGroups: string[]) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
}

const TransferTable = ({
  specGroups,
  setSpecGroups,
  isSaved,
  setIsSaved,
}: Props) => {
  const [tasks, setTasks] = useState<Task[]>(defaultTaks);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRightContainerHovered, setIsRightContainerHovered] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isAllGroupsCollapsed, SetIsAllGroupsCollapsed] = useState(false);
  const [isTranferingRight, setIsTranferingRight] = useState<boolean>(false);
  const [selectedContainer, setSelectedContainer] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const onSelect = (taskId: string) => {
    setSelectedTasks((selected) => {
      if (selected.includes(taskId)) {
        return selected.filter((id) => id !== taskId);
      } else {
        return [...selected, taskId];
      }
    });
  };

  const handleSelect = (id: string) => {
    setSelectedTasks((selectedIds) => {
      if (selectedIds.includes(id)) {
        return selectedIds.filter((value) => value !== id);
      } else {
        return [...selectedIds, id];
      }
    });
  };

  const select = (columnId: string) => {
    if (isTranferingRight) {
      setSelectedContainer(columnId);
      setIsTranferingRight(false);
    }
  };

  const selectAll = () => {
    if (isAllSelected) {
      // If all tasks are selected, unselect all
      setSelectedTasks([]);
    } else {
      // If not all tasks are selected, select all tasks with columnId 'left'
      const leftTasks = tasks
        .filter((task) => task.columnId === "left")
        .map((task) => task.id.toString());
      setSelectedTasks(["left", ...leftTasks]);
    }
    setIsAllSelected((prev) => !prev);
  };

  function onDragStart(event: DragStartEvent) {
    setIsDragging(true);

    const taskId = event.active.id.toString();
    // Find the index of the task that's being dragged
    const taskIndex = tasks.findIndex((task) => task.id.toString() === taskId);

    // Determine if the task is already selected
    const isTaskSelected = selectedTasks.includes(taskId);

    // Calculate yOffset only if the task is already selected
    let yOffset = 0;
    if (isTaskSelected) {
      const firstSelectedIndex = tasks.findIndex((task) =>
        selectedTasks.includes(task.id.toString())
      );
      yOffset = (taskIndex - firstSelectedIndex) * 42; // Example task height, adjust accordingly
    }

    setDragOffset({ x: 0, y: yOffset });

    // Select the task if it's not already selected
    if (!isTaskSelected) {
      setSelectedTasks([taskId]);
    }

    // Hide other selected tasks if necessary
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (
          selectedTasks.length > 1 &&
          selectedTasks.includes(task.id.toString()) &&
          task.id !== event.active.id
        ) {
          return { ...task, hidden: true };
        } else {
          return task;
        }
      })
    );

    // Set activeTask for DragOverlay
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (activeId === overId) return;
    if (!isActiveATask) return;

    // Dropping a Task over another Task (sorting between tasks)
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const overIndex = tasks.findIndex((t) => t.id === overId);

        // Adjusted logic to reorder tasks
        let updatedTasks = [...tasks];
        const movingTasks = updatedTasks.filter((task) =>
          selectedTasks.includes(task.id.toString())
        );

        // Remove selected tasks from their current positions
        updatedTasks = updatedTasks.filter(
          (task) => !selectedTasks.includes(task.id.toString())
        );

        // Determine new index for insertion
        let newIndex = updatedTasks.findIndex((t) => t.id === overId);
        const initialIndex = newIndex;

        const overTaskIndex = tasks.findIndex((t) => t.id === overId);
        const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);

        if (newIndex === -1) {
          // If overId not found in the list, calculate the index based on position
          newIndex = tasks.findIndex((t) => t.id === overId);
        } else {
          // If overId found, check if dragging below it, then increment newIndex
          if (activeTaskIndex > overTaskIndex) {
            // If dragging the task downwards, decrement newIndex
            newIndex--;
          }
        }

        if (activeTaskIndex === 0) {
          newIndex--;
        }

        if (
          event.active.data?.current?.task?.columnId !==
          event.over?.data?.current?.task?.columnId
        ) {
          // Extract the numeric part from the columnId
          const extractNumber = (columnId: string) => {
            return parseInt(columnId.split("-")[1]);
          };

          // Get the numeric values of active and over columnIds
          const activeColumnIdNumber = extractNumber(
            event.active.data?.current?.task?.columnId
          );
          const overColumnIdNumber = extractNumber(
            event.over?.data?.current?.task?.columnId
          );

          // Perform the comparison and adjust newIndex accordingly
          if (activeColumnIdNumber < overColumnIdNumber) {
            newIndex--;
          }

          if (activeColumnIdNumber > overColumnIdNumber) {
            newIndex++;
          }

          if (
            event.active.data?.current?.task?.columnId === "right" &&
            event.over?.data?.current?.task?.columnId !== "right"
          ) {
            newIndex++;
          }

          if (
            event.active.data?.current?.task?.columnId !== "right" &&
            event.over?.data?.current?.task?.columnId === "right"
          ) {
            newIndex--;
          }

          if (
            event.active.data?.current?.task?.columnId !== "left" &&
            event.over?.data?.current?.task?.columnId === "left"
          ) {
            if (initialIndex !== newIndex + 1) {
              newIndex--;
            }
          }

          if (
            event.active.data?.current?.task?.columnId === "left" &&
            event.over?.data?.current?.task?.columnId !== "left"
          ) {
            if (initialIndex !== newIndex + 1) {
              newIndex--;
            }
          }
        }

        // Correctly splice in the moving tasks
        updatedTasks.splice(newIndex + 1, 0, ...movingTasks);

        // Update columnId for all tasks being moved
        updatedTasks = updatedTasks.map((task) => {
          if (selectedTasks.includes(task.id.toString())) {
            return { ...task, columnId: tasks[overIndex].columnId };
          }
          return task;
        });

        return updatedTasks;
      });
    }

    const isOverAColumn =
      over.data.current?.type === "Column" ||
      over.data.current?.type === "Group";

    // Dropping a Task over a column (needed)
    let useCol: string = "";

    const getTaskColumn = (overId: Id) => {
      if (typeof overId === "number") {
        const newCol = tasks.find((item) => item.id === overId);

        useCol = (newCol?.columnId || "") as string;
      } else {
        useCol = overId.toString();
      }

      return useCol;
    };

    getTaskColumn(overId);

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        if (selectedTasks.length > 0) {
          const updatedTasks = tasks.map((task) => {
            if (selectedTasks.includes(task.id.toString())) {
              return { ...task, columnId: useCol };
            }
            return task;
          });

          return updatedTasks;
        } else {
          tasks[activeIndex].columnId = overId;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
      });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    setActiveTask(null);
    setSelectedTasks([]);

    const { active, over } = event;
    if (!over) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) => ({ ...task, hidden: false }))
    );

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    const isActiveAGroup = active.data.current?.type === "Group";
    if (!isActiveAColumn && !isActiveAGroup) return;
  }

  const onDragCancel = () => {
    setActiveTask(null);
  };

  const transferLeft = () => {
    const newTasks = tasks.map((task) => {
      if (selectedTasks.includes(task.id.toString())) {
        return { ...task, columnId: "left" };
      }
      return task;
    });

    setTasks(newTasks);

    setSelectedTasks([]);
  };

  const updateTaskColumnIds = (oldColumnId: string, newColumnId: string) => {
    // Step 1: Update the specGroups array
    const updatedSpecGroups = specGroups.map((group) =>
      group === oldColumnId ? newColumnId : group
    );
    setSpecGroups(updatedSpecGroups);

    // Step 2: Update tasks' columnId to reflect the new spec group title
    const updatedTasks = tasks.map((task) =>
      task.columnId === oldColumnId ? { ...task, columnId: newColumnId } : task
    );
    setTasks(updatedTasks);
  };

  useEffect(() => {
    if (selectedContainer) {
      const newTasks = tasks.map((task) => {
        if (selectedTasks.includes(task.id.toString())) {
          return { ...task, columnId: selectedContainer };
        }
        return task;
      });

      setTasks(newTasks);
      setSelectedTasks([]);
      setSelectedContainer("");
    }
  }, [selectedContainer]);

  useEffect(() => {
    const movedtask = tasks.some((task) => task.columnId !== "left");
    setIsSaved(!movedtask);
  }, [tasks]);

  return (
    <Layout className="results-section">
      <Row className="results-section__container">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragCancel={onDragCancel}
          collisionDetection={closestCenter}
        >
          <Col className="results-section__left-col">
            <Row
              justify="space-between"
              className="results-section__col-header"
            >
              <Space>
                <Text strong>Category Filter</Text>
                <Text className="results-section__pipe">|</Text>
                <Text>{19} Filter</Text>
              </Space>
              <Space>
                <Button onClick={selectAll} type="link">
                  Select All
                </Button>
              </Space>
            </Row>
            <Row className="results-section__col-container">
              <ColumnContainer
                key={"left"}
                columnId={"left"}
                tasks={tasks.filter((task) => task.columnId === "left")}
                onSelect={onSelect}
                isTranferingRight={isTranferingRight}
                selectedTasks={selectedTasks}
                handleSelect={handleSelect}
                count={selectedTasks.length}
                select={select}
              />
            </Row>
          </Col>
          <Col className="results-section__controls">
            <Button
              className="results-section__transfer-btn"
              disabled={isTranferingRight}
              onClick={() => setIsTranferingRight(true)}
            >
              {">"}
            </Button>
            <Button disabled={isTranferingRight} onClick={transferLeft}>
              {"<"}
            </Button>
          </Col>
          <Col
            className={
              isTranferingRight
                ? "results-section__right-col select-area"
                : "results-section__right-col"
            }
          >
            <Row
              align="middle"
              justify="space-between"
              className="results-section__col-header"
            >
              <Text strong>Custom Spec Table Order</Text>
              <Button
                onClick={() => SetIsAllGroupsCollapsed((prev) => !prev)}
                id="collapse-button"
                disabled={specGroups.length === 0}
                className="results-section__collapse-button"
              >
                {isAllGroupsCollapsed
                  ? "Expand All Spec Groups"
                  : "Collapse All Spec Groups"}
              </Button>
            </Row>
            <Row
              className={`results-section__col-container right-container ${
                isRightContainerHovered && isTranferingRight ? "select-container" : ""
              }`}
            >
              <Space direction="vertical" className="w-full">
                {specGroups.map((group, index) => {
                  return (
                    <SpecGroup
                      key={`specGroup-${index}`}
                      columnId={group}
                      droppedTasks={tasks.filter(
                        (task) => task.columnId === group
                      )}
                      allTasks={tasks}
                      onSelect={onSelect}
                      isTranferingRight={isTranferingRight}
                      selectedTasks={selectedTasks}
                      handleSelect={handleSelect}
                      count={selectedTasks.length}
                      select={select}
                      isAllGroupsCollapsed={isAllGroupsCollapsed}
                      specGroups={specGroups}
                      setSpecGroups={setSpecGroups}
                      setTasks={setTasks}
                      updateTaskColumnIds={updateTaskColumnIds}
                      isSaved={isSaved}
                    />
                  );
                })}
                <ColumnContainer
                  key={"right"}
                  columnId={"right"}
                  tasks={tasks.filter((task) => task.columnId === "right")}
                  onSelect={onSelect}
                  isTranferingRight={isTranferingRight}
                  selectedTasks={selectedTasks}
                  handleSelect={handleSelect}
                  count={selectedTasks.length}
                  select={select}
                  isSaved={isSaved}
                  setIsRightContainerHovered={setIsRightContainerHovered}
                />
              </Space>
            </Row>
          </Col>
          {createPortal(
            <DragOverlay>
              {activeTask ? (
                <Row style={{ transform: `translateY(${dragOffset.y}px)` }}>
                  <Item
                    selected={selectedTasks.includes(activeTask.id.toString())}
                    task={activeTask}
                    count={selectedTasks.length}
                    isDragging
                    isSaved={isSaved}
                    isOnLeftSide
                  />
                </Row>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </Row>
    </Layout>
  );
};

export default TransferTable;
