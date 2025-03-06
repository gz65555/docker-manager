"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Play,
  Square,
  RefreshCw,
  Trash2,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Define the Container type based on dockerode's container info
export type Container = {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Status: string;
  Ports: Array<{
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
  }>;
  State: string;
};

// Function to format container status with appropriate badge color
const getStatusBadge = (status: string) => {
  if (status.includes("Up")) {
    return (
      <Badge variant="default" className="bg-green-500">
        Running
      </Badge>
    );
  } else if (status.includes("Exited")) {
    return <Badge variant="destructive">Stopped</Badge>;
  } else if (status.includes("Created")) {
    return (
      <Badge variant="secondary" className="bg-yellow-500">
        Created
      </Badge>
    );
  } else {
    return <Badge variant="outline">{status}</Badge>;
  }
};

// Function to format container name (remove leading slash)
const formatContainerName = (names: string[]) => {
  if (!names || names.length === 0) return "N/A";
  return names[0].replace(/^\//, "");
};

// Function to format ports for display
const formatPorts = (ports: Container["Ports"]) => {
  if (!ports || ports.length === 0) return "None";

  return ports
    .map((port) => {
      if (port.PublicPort) {
        return `${port.PublicPort}:${port.PrivatePort}/${port.Type}`;
      }
      return `${port.PrivatePort}/${port.Type}`;
    })
    .join(", ");
};

// Function to format creation time
const formatCreatedTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// Common cell class for truncation
const cellClass = "truncate";

// Column width classes - using min-width for better responsiveness
const columnWidths = {
  name: "w-[120px]",
  image: "w-[200px] min-w-[100px]",
  status: "w-[100px] min-w-[80px]",
  created: "w-[180px] min-w-[150px]",
  ports: "w-[200px] min-w-[150px]",
  actions: "w-[80px] min-w-[80px]",
};

// Column definitions without the actions column (we'll add it in the component)
export const columns: ColumnDef<Container>[] = [
  {
    accessorKey: "Names",
    header: ({ column }) => {
      return (
        <div className={columnWidths.name}>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div
        className={`${cellClass} ${columnWidths.name}`}
        title={formatContainerName(row.getValue("Names"))}
      >
        {formatContainerName(row.getValue("Names"))}
      </div>
    ),
    filterFn: "includesString"
  },
  {
    accessorKey: "Image",
    header: () => <div className={columnWidths.image}>Image</div>,
    cell: ({ row }) => (
      <div
        className={`${cellClass} ${columnWidths.image}`}
        title={row.getValue("Image")}
      >
        {row.getValue("Image")}
      </div>
    ),
  },
  {
    accessorKey: "Status",
    header: () => <div className={columnWidths.status}>Status</div>,
    cell: ({ row }) => (
      <div className={columnWidths.status}>
        {getStatusBadge(row.getValue("Status"))}
      </div>
    ),
  },
  {
    accessorKey: "Created",
    header: () => <div className={columnWidths.created}>Created</div>,
    cell: ({ row }) => (
      <div className={columnWidths.created}>
        {formatCreatedTime(row.getValue("Created"))}
      </div>
    ),
  },
  {
    accessorKey: "Ports",
    header: () => <div className={columnWidths.ports}>Ports</div>,
    cell: ({ row }) => (
      <div
        className={`${cellClass} ${columnWidths.ports}`}
        title={formatPorts(row.getValue("Ports"))}
      >
        {formatPorts(row.getValue("Ports"))}
      </div>
    ),
  },
];

export function AppContainerTable() {
  const [containers, setContainers] = React.useState<Container[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Function to handle container actions (stop, start, restart, remove)
  const handleContainerAction = async (
    containerId: string, 
    action: 'start' | 'stop' | 'restart' | 'remove', 
    requireConfirmation = false
  ) => {
    // If confirmation required and user cancels, abort
    if (requireConfirmation && !confirm(`Are you sure you want to ${action} this container?`)) {
      return;
    }

    try {
      const method = action === 'remove' ? 'DELETE' : 'POST';
      const response = await fetch(`/api/containers/${containerId}/${action}`, {
        method,
      });
      
      if (response.ok) {
        // Refresh the container list to show updated state
        setLoading(true);
        const refreshResponse = await fetch("/api/containers");
        const data = await refreshResponse.json();
        setContainers(data);
        setLoading(false);
      } else {
        console.error(`Failed to ${action} container`);
      }
    } catch (error) {
      console.error(`Error during ${action} operation:`, error);
      setLoading(false);
    }
  };

  // Define columns with access to the handleContainerAction function
  const actionColumn: ColumnDef<Container> = {
    id: "actions",
    enableHiding: false,
    header: () => <div className={columnWidths.actions}>Actions</div>,
    cell: ({ row }) => {
      const container = row.original;
      console.log(container);
      const isRunning = container.Status.includes("Up");

      return (
        <div className={columnWidths.actions}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-bold">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(container.Id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              {isRunning ? (
                <DropdownMenuItem onClick={() => handleContainerAction(container.Id, 'stop')}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleContainerAction(container.Id, 'start')}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleContainerAction(container.Id, 'restart')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleContainerAction(container.Id, 'remove', true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };

  // Combine the action column with other columns
  const tableColumns = [...columns.filter(col => col.id !== 'actions'), actionColumn];

  // Fetch container data on component mount
  React.useEffect(() => {
    const fetchContainers = async () => {
      try {
        // In a client component, we need to fetch this data from an API endpoint
        const response = await fetch("/api/containers");
        const data = await response.json();
        setContainers(data);
      } catch (error) {
        console.error("Error fetching containers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, []);

  const table = useReactTable({
    data: containers,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const nameColumn = table.getColumn("Names")!;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(nameColumn.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            console.log(event.target.value);
            console.log(table.getColumn("Names"));
            nameColumn.setFilterValue(event.target.value);
          }}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          className="ml-4"
          onClick={() => {
            setLoading(true);
            fetch("/api/containers")
              .then((res) => res.json())
              .then((data) => {
                setContainers(data);
                setLoading(false);
              })
              .catch((err) => {
                console.error("Error refreshing containers:", err);
                setLoading(false);
              });
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading containers...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No containers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* {table.getFilteredSelectedRowModel().rows.length} of{" "} */}
          {/* {table.getFilteredRowModel().rows.length} row(s) selected. */}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
