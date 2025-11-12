export interface DatabaseConnection {
  host: string
  port: number
  database: string
  user: string
  password: string
}

export interface Schema {
  schema_name: string
}

export interface Table {
  table_name: string
  column_count: number
  table_size: number
}

export interface TableColumn {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  constraint_type: string | null
}

export interface QueryResult {
  rows: any[]
  rowCount: number
  fields: { name: string; dataTypeID: number }[]
  executionTime: number
}
