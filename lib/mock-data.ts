export const mockSchemas = [
  {
    schema_name: "public",
    tables: [
      { name: "users", column_count: 6 },
      { name: "posts", column_count: 5 },
      { name: "comments", column_count: 4 },
    ],
  },
  {
    schema_name: "auth",
    tables: [
      { name: "sessions", column_count: 4 },
      { name: "tokens", column_count: 3 },
    ],
  },
]

export const mockTableData = {
  users: [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      created_at: "2024-01-15T10:30:00Z",
      role: "admin",
      active: true,
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      created_at: "2024-02-20T14:22:00Z",
      role: "user",
      active: true,
    },
    {
      id: 3,
      name: "Carol Williams",
      email: "carol@example.com",
      created_at: "2024-03-10T09:15:00Z",
      role: "user",
      active: false,
    },
  ],
  posts: [
    {
      id: 1,
      user_id: 1,
      title: "Getting Started with PostgreSQL",
      content: "A comprehensive guide...",
      created_at: "2024-01-20T11:00:00Z",
    },
    {
      id: 2,
      user_id: 2,
      title: "Database Best Practices",
      content: "Learn about indexing...",
      created_at: "2024-02-25T16:30:00Z",
    },
  ],
  comments: [
    { id: 1, post_id: 1, user_id: 2, content: "Great article!", created_at: "2024-01-21T12:00:00Z" },
    { id: 2, post_id: 1, user_id: 3, content: "Very helpful, thanks!", created_at: "2024-01-22T09:30:00Z" },
  ],
}

export const mockTableStructure = {
  users: [
    {
      column_name: "id",
      data_type: "integer",
      is_nullable: "NO",
      column_default: "nextval('users_id_seq'::regclass)",
      is_primary: true,
    },
    { column_name: "name", data_type: "character varying", is_nullable: "NO", column_default: null, is_primary: false },
    {
      column_name: "email",
      data_type: "character varying",
      is_nullable: "NO",
      column_default: null,
      is_primary: false,
    },
    {
      column_name: "created_at",
      data_type: "timestamp with time zone",
      is_nullable: "NO",
      column_default: "now()",
      is_primary: false,
    },
    {
      column_name: "role",
      data_type: "character varying",
      is_nullable: "NO",
      column_default: "'user'::character varying",
      is_primary: false,
    },
    { column_name: "active", data_type: "boolean", is_nullable: "NO", column_default: "true", is_primary: false },
  ],
  posts: [
    {
      column_name: "id",
      data_type: "integer",
      is_nullable: "NO",
      column_default: "nextval('posts_id_seq'::regclass)",
      is_primary: true,
    },
    { column_name: "user_id", data_type: "integer", is_nullable: "NO", column_default: null, is_primary: false },
    {
      column_name: "title",
      data_type: "character varying",
      is_nullable: "NO",
      column_default: null,
      is_primary: false,
    },
    { column_name: "content", data_type: "text", is_nullable: "YES", column_default: null, is_primary: false },
    {
      column_name: "created_at",
      data_type: "timestamp with time zone",
      is_nullable: "NO",
      column_default: "now()",
      is_primary: false,
    },
  ],
  comments: [
    {
      column_name: "id",
      data_type: "integer",
      is_nullable: "NO",
      column_default: "nextval('comments_id_seq'::regclass)",
      is_primary: true,
    },
    { column_name: "post_id", data_type: "integer", is_nullable: "NO", column_default: null, is_primary: false },
    { column_name: "user_id", data_type: "integer", is_nullable: "NO", column_default: null, is_primary: false },
    { column_name: "content", data_type: "text", is_nullable: "NO", column_default: null, is_primary: false },
    {
      column_name: "created_at",
      data_type: "timestamp with time zone",
      is_nullable: "NO",
      column_default: "now()",
      is_primary: false,
    },
  ],
}
