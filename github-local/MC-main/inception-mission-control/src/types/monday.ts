export type MondayStatus =
  | "Done"
  | "Working on it"
  | "Stuck"
  | "Waiting for review"
  | "Not Started"
  | "In Progress"
  | string;

export type MondayPriority = "Critical" | "High" | "Medium" | "Low" | string;

export interface MondayTask {
  id: string;
  name: string;
  status: MondayStatus;
  priority: MondayPriority;
  assignees: string[];
  dueDate: string | null;
  boardId: string;
  boardName: string;
  isOverdue: boolean;
  updatedAt: string;
}

export interface MondayBoard {
  id: string;
  name: string;
  tasks: MondayTask[];
}

export interface MondayTasksResponse {
  boards: MondayBoard[];
  totalPendingCount: number;
  fetchedAt: string;
}

// Raw Monday.com API types
export interface RawMondayColumnValue {
  id: string;
  text: string;
  value: string | null;
}

export interface RawMondayItem {
  id: string;
  name: string;
  updated_at: string;
  column_values: RawMondayColumnValue[];
}

export interface RawMondayItemsPage {
  items: RawMondayItem[];
}

export interface RawMondayBoard {
  id: string;
  name: string;
  state: string;
  items_page: RawMondayItemsPage;
}

export interface RawMondayResponse {
  data: {
    boards: RawMondayBoard[];
  };
  errors?: Array<{ message: string }>;
}
