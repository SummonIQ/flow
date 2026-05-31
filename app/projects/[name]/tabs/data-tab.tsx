'use client';

import { useEffect, useState } from 'react';
import { Database, Table, Search, RefreshCw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Badge, Report, type ReportColumnDefinition } from '@summoniq/applab-ui';

type TableInfo = {
  name: string;
  count: number;
};

type ColumnInfo = {
  name: string;
  type: string;
  nullable: boolean;
};

type RuntimeProject = {
  name: string;
  description: string;
  path?: string;
  hasConfig?: boolean;
  apps?: any[];
};

interface DataTabProps {
  project: RuntimeProject;
}

export function DataTab({ project }: DataTabProps) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Expand into a full data explorer (schema browser, relationships, row edit/create/delete, filters).
  // TODO: Add database/connection selector and table grouping for multi-app projects.

  // Load tables on mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when selected
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable, page, pageSize, project.name]);

  const loadTables = async () => {
    try {
      const response = await fetch('/api/data/tables');
      if (response.ok) {
        const allTables = await response.json();
        
        // Filter to show only project-related tables
        const projectRelatedTables = allTables.filter((t: TableInfo) => 
          ['Ticket', 'Team', 'KnowledgeDocument'].includes(t.name)
        );
        
        setTables(projectRelatedTables);
        if (projectRelatedTables.length > 0 && !selectedTable) {
          setSelectedTable(projectRelatedTables[0].name);
        }
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadTableData = async (tableName: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/data/tables/${tableName}?page=${page}&pageSize=${pageSize}&projectName=${encodeURIComponent(project.name)}`
      );
      if (response.ok) {
        const result = await response.json();
        setColumns(result.columns);
        setData(result.data);
        setTotalCount(result.total);
        
        // Initialize visible columns
        if (visibleColumns.size === 0) {
          setVisibleColumns(new Set(result.columns.map((c: ColumnInfo) => c.name)));
        }
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleColumnVisibility = (columnName: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnName)) {
      newVisible.delete(columnName);
    } else {
      newVisible.add(columnName);
    }
    setVisibleColumns(newVisible);
  };

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  const visibleTableColumns = columns.filter(col => visibleColumns.has(col.name));
  const renderCellValue = (value: unknown) => {
    if (value === null) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{String(value)}</Badge>;
    }
    if (typeof value === 'object') {
      return (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {JSON.stringify(value)}
        </code>
      );
    }
    return <span className="truncate block max-w-md">{String(value)}</span>;
  };
  const reportColumns: ReportColumnDefinition<any>[] = visibleTableColumns.map(col => ({
    header: col.name,
    key: col.name,
    cellFn: row => renderCellValue(row[col.name]),
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Tables List */}
      <div className="w-64 border-r border-border bg-muted/30 overflow-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Project Data</h2>
          </div>
          <Button
            onClick={loadTables}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="p-2">
          {tables.map(table => (
            <button
              key={table.name}
              onClick={() => {
                setSelectedTable(table.name);
                setPage(1);
                setVisibleColumns(new Set());
              }}
              className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors ${
                selectedTable === table.name
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4" />
                <span className="font-medium truncate">{table.name}</span>
              </div>
              <div className="text-xs opacity-70 mt-1">
                {table.count.toLocaleString()} rows
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Data Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-3">
              {selectedTable && (
                <Button
                  onClick={() => setSelectedTable(null)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 self-start"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Tables
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Table className="w-6 h-6" />
                  {selectedTable || 'Project Data Tables'}
                </h1>
                {selectedTable && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalCount.toLocaleString()} total rows for {project.name}
                  </p>
                )}
              </div>
            </div>

            {selectedTable && (
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                  <option value="200">200 rows</option>
                </select>
              </div>
            )}
          </div>

          {/* Column Visibility Controls */}
          {columns.length > 0 && (
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Visible Columns</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setVisibleColumns(new Set(columns.map(c => c.name)))}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Show All
                  </Button>
                  <Button
                    onClick={() => setVisibleColumns(new Set())}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Hide All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {columns.map(col => (
                  <button
                    key={col.name}
                    onClick={() => toggleColumnVisibility(col.name)}
                    className={`flex items-start gap-2 p-2 rounded-md border transition-colors text-left ${
                      visibleColumns.has(col.name)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                  >
                    {visibleColumns.has(col.name) ? (
                      <Eye className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{col.name}</div>
                      <div className="text-xs text-muted-foreground">{col.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredData.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Report
                  className="h-auto border-0 bg-transparent shadow-none"
                  data={filteredData}
                  definition={{
                    columns: reportColumns,
                    data: filteredData,
                    view: 'table' as any,
                    sortBy: visibleTableColumns[0]?.name ?? 'id',
                    activeFilters: [],
                    filters: [],
                  }}
                  search={false}
                />
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              {selectedTable ? 'No data found for this project' : 'Select a table to view data'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {selectedTable && totalPages > 1 && (
          <div className="p-4 border-t border-border bg-background flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages} • Showing {filteredData.length} of {totalCount} rows
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
