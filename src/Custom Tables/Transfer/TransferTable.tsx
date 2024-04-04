import { useEffect, useState } from "react";
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
import { Id, SpecGroupType, Task } from "./Types";
import SpecGroup from "./SpecGroup";
import Item from "./Item";
import { createPortal } from "react-dom";
import "../../styles/custom-spec-table-transfer.less";

const { Text } = Typography;

interface Props {
  specGroups: SpecGroupType[];
  setSpecGroups: (specGroups: SpecGroupType[]) => void;
  isTableEdited: boolean;
  setIsTableEdited: (isTableEdited: boolean) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const TransferTable = ({
  specGroups,
  setSpecGroups,
  isTableEdited,
  setIsTableEdited,
  tasks,
  setTasks,
}: Props) => {
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

  const selectRightContainer = (columnId: string) => {
    if (isTranferingRight) {
      setSelectedContainer(columnId);
      setIsTranferingRight(false);

      // Update tasks to mark them as edited when they are moved to a container that is not 'left'
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (selectedTasks.includes(task.id.toString())) {
            // If the container is not 'left', mark the task as edited
            const isEdited = columnId !== "left";
            return { ...task, columnId, edited: isEdited };
          }
          return task;
        })
      );

      // Update specGroups to mark the group as edited if tasks are being moved to it
      setSpecGroups((prevSpecGroups) =>
        prevSpecGroups.map((group) =>
          group.name === columnId ? { ...group, isEdited: true } : group
        )
      );
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
      if (selectedTasks.length <= 1) {
        yOffset = (taskIndex - firstSelectedIndex) * 42; // Example task height, adjust accordingly
      }
      if (selectedTasks.length > 1) {
        if (
          taskIndex > Number(selectedTasks[0]) ||
          taskIndex === Number(selectedTasks[0])
        ) {
          const sortedTasks = selectedTasks.map(Number).sort((a, b) => a - b);
          const draggingIndex = sortedTasks.indexOf(Number(taskId));
          if (taskId <= 14) {
            yOffset = draggingIndex * 48;
          }
        }
      }
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

        if (activeTaskIndex > overTaskIndex) {
          // If dragging the task downwards, decrement newIndex
          newIndex--;
        }

        if (
          event.active.data?.current?.task?.columnId !==
          event.over?.data?.current?.task?.columnId
        ) {
          const specOrder = ["left", "Dimension", "Size", "Width", "right"];
          const activeSpecColIndex = specOrder.indexOf(
            event.active.data?.current?.task?.columnId
          );
          const overSpecColIndex = specOrder.indexOf(
            event.over?.data?.current?.task?.columnId
          );

          if (activeSpecColIndex > overSpecColIndex) {
            newIndex++;
          }

          if (activeSpecColIndex < overSpecColIndex) {
            newIndex--;
          }

          if (newIndex === -2) {
            newIndex++;
          }

          if (
            event.active.data?.current?.task?.columnId !== "left" &&
            event.over?.data?.current?.task?.columnId === "left"
          ) {
            if (initialIndex !== newIndex + 1) {
              newIndex = initialIndex - 1;
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

    if (isActiveATask && isOverAColumn) {
      setTasks((currentTasks) => {
        return currentTasks.map((task) => {
          if (selectedTasks.includes(task.id.toString())) {
            // Directly set 'edited' based on the column the task is being moved to
            const isMovingToNonLeftColumn = useCol !== "left";
            return {
              ...task,
              columnId: useCol,
              edited: isMovingToNonLeftColumn,
            };
          }
          return task;
        });
      });
    }

    if (isActiveATask && isOverATask) {
      setTasks((currentTasks) => {
        const targetColumn = currentTasks.find(
          (task) => task.id === overId
        )?.columnId;
        const isTargetColumnNotLeft = targetColumn !== "left";

        return currentTasks.map((task) => {
          if (selectedTasks.includes(task.id.toString())) {
            // Update 'edited' based on whether the target column is 'left' or not
            return {
              ...task,
              // Assuming columnId update logic is handled correctly elsewhere in your code
              edited: isTargetColumnNotLeft,
            };
          }
          return task;
        });
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

    // Initialize a set to keep track of spec groups that need to be updated as edited
    const editedSpecGroups = new Set<string>();

    // Iterate through tasks to check for any edited tasks
    tasks.forEach((task) => {
      if (task.edited) {
        editedSpecGroups.add(task.columnId);
      }
    });

    // If there are any edited spec groups, update the corresponding specGroups' isEdited property
    if (editedSpecGroups.size > 0) {
      setSpecGroups((prevSpecGroups) =>
        prevSpecGroups.map((group) =>
          editedSpecGroups.has(group.name)
            ? { ...group, isEdited: true }
            : group
        )
      );
    }

    const activeId = active.id;
    const overId = over.id;
    const overType = over.data.current?.type;

    if (overType === "Column" || overType === "Group") {
      const newSpecGroups = specGroups.map((group) => {
        if (group.name === overId) {
          return { ...group, isEdited: true };
        }
        return group;
      });

      setSpecGroups(newSpecGroups);
    }

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
          return { ...task, columnId: selectedContainer, edited: true };
        }
        return task;
      });

      setTasks(newTasks);
      setSelectedTasks([]);
      setSelectedContainer("");
    }
  }, [selectedContainer]);

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
                selectRightContainer={selectRightContainer}
                setIsRightContainerHovered={setIsRightContainerHovered}
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
                isRightContainerHovered && isTranferingRight
                  ? "select-container"
                  : ""
              }`}
            >
              <Space direction="vertical" className="w-full">
                {specGroups.map((group, index) => {
                  return (
                    <SpecGroup
                      key={`specGroup-${index}`}
                      columnId={group.name}
                      droppedTasks={tasks.filter(
                        (task) => task.columnId === group.name
                      )}
                      allTasks={tasks}
                      onSelect={onSelect}
                      isTranferingRight={isTranferingRight}
                      selectedTasks={selectedTasks}
                      handleSelect={handleSelect}
                      count={selectedTasks.length}
                      selectRightContainer={selectRightContainer}
                      isAllGroupsCollapsed={isAllGroupsCollapsed}
                      specGroups={specGroups}
                      setSpecGroups={setSpecGroups}
                      setTasks={setTasks}
                      updateTaskColumnIds={updateTaskColumnIds}
                      isTableEdited={isTableEdited}
                      setIsTableEdited={setIsTableEdited}
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
                  selectRightContainer={selectRightContainer}
                  isTableEdited={isTableEdited}
                  setIsTableEdited={setIsTableEdited}
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
                    isTableEdited={isTableEdited}
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
