import { useContext, useId, useRef, useState } from "react"
import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import {
	CircleXIcon,
	Columns3Icon,
	ListFilterIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PaginationTanstack } from "@/components/table/pagination"
import { TableTanstack } from "@/components/table"
import { LeadContext, type Opportunity } from "@/context/lead-context"

type Item = Opportunity

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Item> = (row, _, filterValue) => {
	const searchableRowContent =
		`${row.original.name}`.toLowerCase()
	const searchTerm = (filterValue ?? "").toLowerCase()
	return searchableRowContent.includes(searchTerm)
}

const statusFilterFn: FilterFn<Item> = (
	row,
	columnId,
	filterValue: string[]
) => {
	if (!filterValue?.length) return true
	const stage = row.getValue(columnId) as string
	return filterValue.includes(stage)
}

const columns: ColumnDef<Item>[] = [
	{
		header: "Name",
		accessorKey: "name",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
		filterFn: multiColumnFilterFn,
		enableHiding: false,
	},
	{
		header: "Amount",
		accessorKey: "amount",
	},
	{
		header: "AccountName",
		accessorKey: "accountName",
	},
	{
		header: "Stage",
		accessorKey: "stage",
		cell: ({ row }) => (
			<Badge
			>
				{row.getValue("stage")}
			</Badge>
		),
		filterFn: statusFilterFn,
	},
]

export function Opportunities() {
	const context = useContext(LeadContext)

	const opportunities = context?.opportunities
	const isLoading = context?.isLoading

	const id = useId()
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})
	const inputRef = useRef<HTMLInputElement>(null)

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "name",
			desc: false,
		},
	])

	const table = useReactTable({
		data: opportunities || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
		},
	})

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					{/* Filter by name or email */}
					<div className="relative">
						<Input
							disabled={isLoading}
							id={`${id}-input`}
							ref={inputRef}
							className={cn(
								"peer min-w-60 ps-9",
								Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9"
							)}
							value={
								(table.getColumn("name")?.getFilterValue() ?? "") as string
							}
							onChange={(e) =>
								table.getColumn("name")?.setFilterValue(e.target.value)
							}
							placeholder="Filter by name or company..."
							type="text"
							aria-label="Filter by name or company"
						/>
						<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
							<ListFilterIcon size={16} aria-hidden="true" />
						</div>
						{Boolean(table.getColumn("name")?.getFilterValue()) && (
							<button
								className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Clear filter"
								onClick={() => {
									table.getColumn("name")?.setFilterValue("")
									if (inputRef.current) {
										inputRef.current.focus()
									}
								}}
							>
								<CircleXIcon size={16} aria-hidden="true" />
							</button>
						)}
					</div>
					{/* Toggle columns visibility */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button disabled={isLoading} variant="outline">
								<Columns3Icon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								View
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
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
											onSelect={(event) => event.preventDefault()}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									)
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<TableTanstack isLoading={!!isLoading} table={table} />

			{/* Pagination */}
			<PaginationTanstack table={table} />
		</div>
	)
}