// Whitelisted GraphQL queries for the Monday.com API proxy.
// The API route validates that only these named queries are used.

export const GET_ALL_BOARDS_WITH_TASKS = `
  query GetAllBoardsWithTasks {
    boards(limit: 25, order_by: used_at) {
      id
      name
      state
      items_page(limit: 100) {
        items {
          id
          name
          updated_at
          column_values(ids: ["status", "priority", "person", "date4", "due_date"]) {
            id
            text
            value
          }
        }
      }
    }
  }
`;

export const ALLOWED_QUERIES: Record<string, string> = {
  GetAllBoardsWithTasks: GET_ALL_BOARDS_WITH_TASKS,
};
