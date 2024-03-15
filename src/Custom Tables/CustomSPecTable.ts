export interface SelectedCategoryProps{
    selectedCategory: {
        categoryId: number;
        categoryName: string;
    };
    setSelectedCategory?: (category: { 
        categoryId: number; 
        categoryName: string 
    }) => void;
}

export interface Filters {
    categoryId: number;
    customSpecificationGroupId: number;
    customSpecificationGroupName: string;
    productFilterId: number;
    productFilterName: string;
    sortOrder: number;
}

export type Id = string | number;

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  hidden?: boolean;
};

export type Container = {
  tasks: Task[];
  count: number;
  columnId: string;
  selectedTasks: string[];
  isTranferingRight: boolean;
  select: (value: string) => void;
  onSelect: (value: string) => void;
  handleSelect: (value: string) => void;
}