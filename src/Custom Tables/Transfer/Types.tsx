export type Id = string | number;

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  hidden?: boolean;
  edited: boolean;
};

export type Container = {
  tasks?: Task[];
  count: number;
  columnId: string;
  isTableEdited?: boolean;
  selectedTasks: string[];
  isTranferingRight: boolean;
  selectRightContainer: (columnId: string) => void;
  onSelect: (taskId: string) => void;
  handleSelect: (taskId: string) => void;
  setIsRightContainerHovered?: (isHovered: boolean) => void;
  setIsTableEdited?: (isTableEdited: boolean) => void;
};

export type SpecGroupProps = Container & {
  isAllGroupsCollapsed?: boolean;
  setSpecGroups?: (specGroups: SpecGroupType[]) => void;
  specGroups?: SpecGroupType[];
  setTasks?: (tasks: Task[]) => void;
  updateTaskColumnIds?: (oldColumnId: string, newColumnId: string) => void;
  allTasks?: Task[];
  droppedTasks?: Task[];
};

export type SpecGroupType = {
  name: string;
  isEdited: boolean;
};