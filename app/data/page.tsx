'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
  Report,
  type ReportColumnDefinition,
} from '@summoniq/applab-ui';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Table,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type TableInfo = {
  name: string;
  count: number;
};

type ColumnInfo = {
  name: string;
  type: string;
  nullable: boolean;
};

export default function DataPage() {
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
  const [columnFilter, setColumnFilter] = useState('');
  const [tablesPanelOpen, setTablesPanelOpen] = useState(false);

  // Load tables on mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when selected
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable, page, pageSize]);

  const loadTables = async () => {
    try {
      const response = await fetch('/api/data/tables');
      if (response.ok) {
        const allTables = await response.json();

        // Filter to show only global tables (not project-specific ones)
        const globalTables = allTables.filter((t: TableInfo) =>
          ['Project', 'Agent', 'Workflow'].includes(t.name),
        );

        setTables(globalTables);
        if (globalTables.length > 0 && !selectedTable) {
          setSelectedTable(globalTables[0].name);
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
        `/api/data/tables/${tableName}?page=${page}&pageSize=${pageSize}`,
      );
      if (response.ok) {
        const result = await response.json();
        setColumns(result.columns);
        setData(result.data);
        setTotalCount(result.total);

        // Initialize visible columns
        if (visibleColumns.size === 0) {
          setVisibleColumns(
            new Set(result.columns.map((c: ColumnInfo) => c.name)),
          );
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

  const visibleTableColumns = useMemo(
    () => columns.filter(col => visibleColumns.has(col.name)),
    [columns, visibleColumns],
  );

  const visibleColumnsPicker = useMemo(() => {
    const q = columnFilter.trim().toLowerCase();
    if (!q) return columns;
    return columns.filter(col => col.name.toLowerCase().includes(q));
  }, [columnFilter, columns]);

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase()),
    );
  });
  const renderDataValue = (value: unknown) => {
    if (value === null) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{String(value)}</Badge>;
    }
    if (typeof value === 'object') {
      return (
        <code className="max-w-[320px] truncate rounded bg-muted px-2 py-1 text-xs">
          {JSON.stringify(value)}
        </code>
      );
    }
    return <span className="block max-w-md truncate font-mono">{String(value)}</span>;
  };
  const reportColumns = useMemo<ReportColumnDefinition<any>[]>(
    () =>
      visibleTableColumns.map(col => ({
        header: col.name,
        key: col.name,
        cellFn: row => renderDataValue(row[col.name]),
      })),
    [visibleTableColumns],
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Page className="h-full p-0">
      {/* Tables Slide Panel */}
      <Modal
        open={tablesPanelOpen}
        onOpenChange={setTablesPanelOpen}
        overlay={false}
      >
        <ModalContent
          variant="slide"
          margin="none"
          showOverlay={false}
          className="z-40 top-[calc(2.75rem+0.5rem)]! left-[13.5rem]! bottom-10! h-auto! w-[280px]! max-w-[280px]! rounded-2xl shadow-2xl shadow-black/20"
        >
          <ModalHeader
            title={
              <div className="flex items-center gap-2">
                <div className="pointer-events-none rounded-lg bg-primary/10 p-1.5 text-primary">
                  <Database className="h-4 w-4" />
                </div>
                <ModalTitle className="text-sm font-medium">Tables</ModalTitle>
              </div>
            }
            actions={
              <Button
                onClick={loadTables}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            }
            showClose={true}
          />
          <ModalBody>
            <div className="space-y-1">
              {tables.map(table => (
                <button
                  key={table.name}
                  onClick={() => {
                    setSelectedTable(table.name);
                    setPage(1);
                    setTablesPanelOpen(false);
                  }}
                  className={`group w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedTable === table.name
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="truncate text-sm font-medium">
                      {table.name}
                    </span>
                    <span className="ml-auto text-xs opacity-80">
                      {table.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-xs opacity-70">rows</div>
                </button>
              ))}
              {tables.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No tables found
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Main Content - Data Grid */}
      <div className="flex h-full min-w-0 flex-col">
        {/* Header */}
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <Table className="h-6 w-6" />
              {selectedTable || 'Database Tables'}
            </span>
          }
          description={
            selectedTable
              ? `${totalCount.toLocaleString()} total rows`
              : 'Browse global tables'
          }
          actions={
            <div className="flex gap-2">
              <Button
                onClick={() => setTablesPanelOpen(true)}
                variant="outline"
                size="sm"
              >
                <Database className="mr-2 h-4 w-4" />
                Tables
              </Button>
              {selectedTable && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="h-9 w-[260px] rounded-md border border-border bg-background/70 pl-9 pr-3 text-sm shadow-sm outline-none ring-0 transition focus:bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-9 rounded-md border border-border bg-background/70 px-3 text-sm shadow-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary"
                  >
                    <option value="25">25 rows</option>
                    <option value="50">50 rows</option>
                    <option value="100">100 rows</option>
                    <option value="200">200 rows</option>
                  </select>
                </>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            {/* Column Visibility Controls */}
            {columns.length > 0 && (
              <Card className="p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Visible Columns</h3>
                    <span className="text-xs text-muted-foreground">
                      {visibleColumns.size}/{columns.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setVisibleColumns(new Set(columns.map(c => c.name)))
                      }
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

                <div className="mb-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter columns..."
                      value={columnFilter}
                      onChange={e => setColumnFilter(e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background/70 pl-9 pr-3 text-sm shadow-sm outline-none ring-0 transition focus:bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setColumnFilter('')}
                    disabled={columnFilter.trim().length === 0}
                    className="h-9"
                  >
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleColumnsPicker.map(col => (
                    <button
                      key={col.name}
                      onClick={() => toggleColumnVisibility(col.name)}
                      className={`group flex items-start gap-2 rounded-lg border p-2 text-left transition-colors ${
                        visibleColumns.has(col.name)
                          ? 'border-primary/40 bg-primary/10 shadow-sm'
                          : 'border-border bg-background/40 hover:bg-muted/40'
                      }`}
                    >
                      {visibleColumns.has(col.name) ? (
                        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">
                          {col.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px]"
                          >
                            {col.type}
                          </Badge>
                          {col.nullable ? (
                            <Badge
                              variant="outline"
                              className="h-5 px-2 text-[10px] text-muted-foreground"
                            >
                              nullable
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </PageHeader>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
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
              {selectedTable ? 'No data found' : 'Select a table to view data'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {selectedTable && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-background/70 p-4 backdrop-blur">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages} • Showing {filteredData.length} of{' '}
              {totalCount} rows
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
