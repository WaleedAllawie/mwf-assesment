import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { fetchUsers } from '@/api/client'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table'
import { UserResponse } from '@/types'
import { Loader2, ArrowUpDown, Search, Database } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Route = createLazyFileRoute('/')({
  component: Index,
})

export function Index() {
  const [hasStarted, setHasStarted] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: hasStarted,
  })

  const columnHelper = createColumnHelper<UserResponse>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium text-textMain">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-textMuted">{info.getValue()}</span>,
      }),
      columnHelper.accessor('created_at', {
        header: 'Joined',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-slide-up">
        <button
          onClick={() => setHasStarted(true)}
          className="group relative px-8 py-4 bg-primary hover:bg-primaryHover text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative flex items-center gap-2">
            <Database className="w-5 h-5" />
            Load Users
          </span>
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in text-textMuted">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p>Fetching strictly typed data...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="glass rounded-2xl p-8 max-w-lg mx-auto text-center border-red-500/30 animate-fade-in">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-semibold text-red-400 mb-2">Failed to load data</h2>
        <p className="text-textMuted mb-4">{(error as Error).message}</p>
        <button
          onClick={() => setHasStarted(false)}
          className="px-6 py-2 bg-surface hover:bg-surface/80 rounded-lg transition-colors border border-white/5"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="animate-slide-up space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-textMuted" />
        </div>
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-11 pr-4 py-3 bg-surface/50 border border-white/10 rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
        />
      </div>

      {/* Tanstack Table */}
      <div className="glass rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-white/10 bg-surface/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-semibold text-textMuted uppercase text-xs tracking-wider cursor-pointer hover:bg-white/5 transition-colors group select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown className={cn(
                          "w-4 h-4 transition-opacity",
                          header.column.getIsSorted() ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"
                        )} />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {table.getRowModel().rows.length === 0 && (
          <div className="p-8 text-center text-textMuted">
            No users found matching "{globalFilter}"
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-textMuted">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-surface hover:bg-surface/80 rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-surface hover:bg-surface/80 rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
