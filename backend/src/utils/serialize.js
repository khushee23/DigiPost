// The React frontend expects `_id` (it was written for MongoDB) while Supabase
// returns `id`. These helpers add `_id` and make sure passwords never leave the server.

export const withClientId = (row) => (row ? { _id: row.id, ...row } : row);

export const toClientUser = (row) => {
  if (!row) return row;
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = row;
  return { _id: safe.id, ...safe, createdAt: safe.created_at };
};
