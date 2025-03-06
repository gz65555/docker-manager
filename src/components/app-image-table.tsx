"use client"
import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { MoreHorizontal, Copy, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Define column widths for consistent layout
const columnWidths = {
  id: "w-[180px]",
  repository: "w-[200px]",
  tag: "max-w-[120px]",
  size: "w-[120px]",
  created: "w-[180px]",
  actions: "w-[80px]",
};

// Define cell class for text truncation
const cellClass = "truncate";

// Define the Image type based on Docker API response
export type Image = {
  Id: string;
  RepoTags: string[];
  RepoDigests: string[];
  Created: number;
  Size: number;
  VirtualSize: number;
  SharedSize: number;
  Labels: Record<string, string> | null;
  Containers: number;
};

// Format the image size to be human-readable
const formatSize = (size: number) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let formattedSize = size;
  let unitIndex = 0;

  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024;
    unitIndex++;
  }

  return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
};

// Format the created timestamp to a readable date
const formatCreatedTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-CA'); // en-CA uses yyyy/mm/dd format
};

// Extract repository and tag from RepoTags
const parseRepoTag = (repoTags: string[]) => {
  if (!repoTags || repoTags.length === 0 || repoTags[0] === "<none>:<none>") {
    return { repository: "<none>", tag: "<none>" };
  }

  const [repository, tag] = repoTags[0].split(":");
  return { repository, tag };
};

// Format the image ID to be shorter
const formatImageId = (id: string) => {
  if (!id) return "";
  // Remove the "sha256:" prefix if present
  const cleanId = id.startsWith("sha256:") ? id.substring(7) : id;
  // Return the first 12 characters
  return cleanId.substring(0, 12);
};

export function AppImageTable() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Define columns
  const columns: ColumnDef<Image>[] = [
    {
      accessorKey: "Id",
      header: () => <div className={columnWidths.id}>ID</div>,
      cell: ({ row }) => {
        const id = formatImageId(row.original.Id);
        return (
          <div 
            className={`${cellClass} ${columnWidths.id}`}
            title={id}
          >
            {id}
          </div>
        );
      },
    },
    {
      accessorKey: "RepoTags",
      header: () => <div className={columnWidths.repository}>Repository</div>,
      cell: ({ row }) => {
        const { repository } = parseRepoTag(row.original.RepoTags);
        return (
          <div 
            className={`${cellClass} ${columnWidths.repository}`}
            title={repository}
          >
            {repository}
          </div>
        );
      },
    },
    {
      accessorKey: "tag",
      header: () => <div className={columnWidths.tag}>Tag</div>,
      cell: ({ row }) => {
        const { tag } = parseRepoTag(row.original.RepoTags);
        return (
          <div className={columnWidths.tag}>
            <Badge className={columnWidths.tag + ' block'} variant="outline">{tag}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "Size",
      header: () => <div className={columnWidths.size}>Size</div>,
      cell: ({ row }) => {
        const size = formatSize(row.original.Size);
        return (
          <div 
            className={`${cellClass} ${columnWidths.size}`}
            title={size}
          >
            {size}
          </div>
        );
      },
    },
    {
      accessorKey: "Created",
      header: () => <div className={columnWidths.created}>Created</div>,
      cell: ({ row }) => {
        const created = formatCreatedTime(row.original.Created);
        return (
          <div 
            className={`${cellClass} ${columnWidths.created}`}
            title={created}
          >
            {created}
          </div>
        );
      },
    },
  ];

  // Define action column
  const actionColumn: ColumnDef<Image> = {
    id: "actions",
    enableHiding: false,
    header: () => <div className={columnWidths.actions}>Actions</div>,
    cell: ({ row }) => {
      const image = row.original;

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
                onClick={() => navigator.clipboard.writeText(image.Id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };

  // Add the action column to the columns array
  const allColumns = [...columns, actionColumn];

  // Create the table instance
  const table = useReactTable({
    data: images,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Function to fetch images
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/images");
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        console.error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render loading skeletons
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {allColumns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Render the table
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchImages}
          className="ml-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
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
                    colSpan={allColumns.length}
                    className="h-24 text-center"
                  >
                    No images found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
} 