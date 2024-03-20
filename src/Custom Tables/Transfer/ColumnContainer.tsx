import {
    SortableContext,
    useSortable,
    rectSortingStrategy,
  } from "@dnd-kit/sortable";
  import { Container } from "./Types";
  import React, { useMemo } from "react";
  import SortableItem from "./SortableItem";
  
  const ColumnContainer = ({
    tasks,
    count,
    select,
    isSaved,
    columnId,
    handleSelect,
    selectedTasks,
    isTranferingRight,
    setIsRightContainerHovered,
  }: Container) => {
    const { setNodeRef } = useSortable({
      id: columnId,
      data: {
        type: "Column",
        columnId,
      },
    });
  
    const tasksIds = useMemo(() => {
      return tasks.map((task) => task.id);
    }, [tasks]);
  
    return (
      <div
        ref={setNodeRef}
        className={
          isTranferingRight && columnId !== "left"
            ? "filter-container select-container right-container"
            : "filter-container left-container"
        }
        onClick={() => select(columnId)}
        onMouseEnter={() => setIsRightContainerHovered(true)}
        onMouseLeave={() => setIsRightContainerHovered(false)}
      >
        <SortableContext strategy={rectSortingStrategy} items={tasksIds}>
          {tasks.map((task) =>
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
      </div>
    );
  }
  
  export default ColumnContainer;