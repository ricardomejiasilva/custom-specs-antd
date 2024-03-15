export type Id = string | number;

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  hidden?: boolean;
};

export type Container = {
  tasks?: Task[];
  count: number;
  columnId: string;
  isSaved?: boolean;
  selectedTasks: string[];
  isTranferingRight: boolean;
  select: (columnId: string) => void;
  onSelect: (taskId: string) => void;
  handleSelect: (taskId: string) => void;
};

export type SpecGroupProps = Container & {
  isAllGroupsCollapsed?: boolean;
  setSpecGroups?: (specGroups: string[]) => void;
  specGroups?: string[];
  setTasks?: (tasks: Task[]) => void;
  updateTaskColumnIds?: (oldColumnId: string, newColumnId: string) => void;
  allTasks?: Task[];
  droppedTasks?: Task[];
};