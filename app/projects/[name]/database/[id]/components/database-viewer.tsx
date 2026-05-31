'use client';

import { useState, useEffect, useMemo } from 'react';
import { Database, Table as TableIcon, Eye, Edit, Trash2, Plus, RefreshCw, Search, Filter } from 'lucide-react';
import { Button, Input, Badge, Report, type ReportColumnDefinition } from '@summoniq/applab-ui';
import { toast } from 'sonner';

interface Table {
  name: string;
  schema: string;
  rowCount: number;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: string;
}

interface DatabaseViewerProps {
  projectName: string;
  databaseId: string;
}

export function DatabaseViewer({ projectName, databaseId }: DatabaseViewerProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 50;
  const reportRows = useMemo(
    () =>
      data.map((row, idx) => ({
        ...row,
        __rowNumber: (currentPage - 1) * rowsPerPage + idx + 1,
      })),
    [currentPage, data],
  );
  const renderCellValue = (value: unknown) => {
    if (value === null) {
      return <span className="text-muted-foreground italic">NULL</span>;
    }
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'outline'}>{value ? 'true' : 'false'}</Badge>;
    }
    if (typeof value === 'object') {
      return (
        <code className="text-xs bg-secondary px-2 py-1 rounded">
          {JSON.stringify(value)}
        </code>
      );
    }
    return String(value);
  };
  const reportColumns = useMemo<ReportColumnDefinition<any>[]>(
    () => [
      {
        header: '#',
        key: '__rowNumber',
      },
      ...columns.map(col => ({
        header: `${col.name}${col.primaryKey ? ' (PK)' : ''}${col.foreignKey ? ' (FK)' : ''}`,
        key: col.name,
        cellFn: (row: any) => <div className="max-w-xs truncate">{renderCellValue(row[col.name])}</div>,
      })),
      {
        header: 'Actions',
        align: 'right',
        key: '__actions',
        cellFn: () => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" disabled>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [columns],
  );

  // Load tables on mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when selected
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable, currentPage]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/projects/${projectName}/databases/${databaseId}/tables`
      );
      if (!response.ok) throw new Error('Failed to load tables');
      const tablesData = await response.json();
      setTables(tablesData);
      if (tablesData.length > 0 && !selectedTable) {
        setSelectedTable(tablesData[0].name);
      }
    } catch (error) {
      toast.error('Failed to load tables');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    setLoading(true);
    try {
      // Load schema
      const schemaResponse = await fetch(
        `/api/projects/${projectName}/databases/${databaseId}/tables/${tableName}/schema`
      );
      if (!schemaResponse.ok) throw new Error('Failed to load schema');
      const columnsData = await schemaResponse.json();
      setColumns(columnsData);

      // Load data
      const dataResponse = await fetch(
        `/api/projects/${projectName}/databases/${databaseId}/tables/${tableName}/data?page=${currentPage}&limit=${rowsPerPage}&search=${searchQuery}`
      );
      if (!dataResponse.ok) throw new Error('Failed to load data');
      const result = await dataResponse.json();
      setData(result.data);
      setTotalPages(Math.ceil(result.total / rowsPerPage));
    } catch (error) {
      toast.error('Failed to load table data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedTable) {
      setCurrentPage(1);
      loadTableData(selectedTable);
    }
  };

  const handleRefresh = () => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Tables List */}
      <div className="w-64 border-r border-border bg-secondary/10 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5" />
            <h2 className="font-semibold">Tables</h2>
            <Badge variant="outline" className="ml-auto">
              {tables.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={loadTables}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tables.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tables found
            </div>
          ) : (
            <div className="p-2">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table.name)}
                  className={`w-full text-left p-3 rounded-md mb-1 transition-colors ${
                    selectedTable === table.name
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{table.name}</div>
                      <div className={`text-xs ${
                        selectedTable === table.name
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {table.rowCount} rows
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Table Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <TableIcon className="w-5 h-5" />
                {selectedTable || 'Select a table'}
              </h1>
              {selectedTable && (
                <p className="text-sm text-muted-foreground mt-1">
                  {data.length} of {tables.find(t => t.name === selectedTable)?.rowCount || 0} rows
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" disabled>
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedTable ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a table to view its data</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <TableIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No data in this table</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Report
                className="h-auto border-0 bg-transparent shadow-none"
                data={reportRows}
                definition={{
                  columns: reportColumns,
                  data: reportRows,
                  view: 'table' as any,
                  sortBy: '__rowNumber',
                  activeFilters: [],
                  filters: [],
                }}
                search={false}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {selectedTable && totalPages > 1 && (
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
