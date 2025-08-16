import { useContext, useId, useMemo, useRef, useState } from "react"
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
	CircleAlertIcon,
	CircleXIcon,
	Columns3Icon,
	FilterIcon,
	ListFilterIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { PaginationTanstack } from "@/components/table/pagination"
import { TableTanstack } from "@/components/table"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LeadHandler } from "./handler"
import { LeadActions } from "./actions"
import { LeadContext, type Lead } from "@/context/lead-context"
import JSON_LEADS from '@/data/leads.json'
import { toast } from "sonner"

type Item = {
	id: string
	name: string
	company: string
	email: string
	source: string
	score: number
	status: "new" | "converted"
}

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Item> = (row, _, filterValue) => {
	const searchableRowContent =
		`${row.original.name} ${row.original.company}`.toLowerCase()
	const searchTerm = (filterValue ?? "").toLowerCase()
	return searchableRowContent.includes(searchTerm)
}

const statusFilterFn: FilterFn<Item> = (
	row,
	columnId,
	filterValue: string[]
) => {
	if (!filterValue?.length) return true
	const status = row.getValue(columnId) as string
	return filterValue.includes(status)
}

const columns: ColumnDef<Item>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		size: 28,
		enableSorting: false,
		enableHiding: false,
	},
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
		header: "Email",
		accessorKey: "email",
		size: 300
	},
	{
		header: "Company",
		accessorKey: "company",
	},
	{
		header: "Source",
		accessorKey: "source",
	},
	{
		header: "Score",
		accessorKey: "score",
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => (
			<Badge>
				{row.getValue("status")}
			</Badge>
		),
		filterFn: statusFilterFn,
	},
	{
		header: "Actions",
		accessorKey: "actions",
		cell: ({ row }) => <LeadActions data={row.original} />,
		enableSorting: false,
		enableHiding: false,
	},
]

export function Leads() {
	const context = useContext(LeadContext)

	const leads = context?.leads
	const isLoading = context?.isLoading
	const deleteLeads = context?.deleteLeads
	const bulkAddLeads = context?.bulkAddLeads

	const [open, setOpen] = useState(false)

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

	const handleDeleteRows = async () => {
		const selectedIds = table.getSelectedRowModel()?.rows?.map(item => item?.original?.id)
		if (!deleteLeads) return
		await deleteLeads(selectedIds)
		table.resetRowSelection()
	}

	const table = useReactTable({
		data: leads || [],
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

	// Get counts for each status
	const statusCounts = useMemo(() => {
		const statusColumn = table.getColumn("status")
		if (!statusColumn) return new Map()
		return statusColumn.getFacetedUniqueValues()
	}, [table.getColumn("status")?.getFacetedUniqueValues()])

	const selectedStatuses = useMemo(() => {
		const filterValue = table.getColumn("status")?.getFilterValue() as string[]
		return filterValue ?? []
	}, [table.getColumn("status")?.getFilterValue()])

	const handleStatusChange = (checked: boolean, value: string) => {
		const filterValue = table.getColumn("status")?.getFilterValue() as string[]
		const newFilterValue = filterValue ? [...filterValue] : []

		if (checked) {
			newFilterValue.push(value)
		} else {
			const index = newFilterValue.indexOf(value)
			if (index > -1) {
				newFilterValue.splice(index, 1)
			}
		}

		table
			.getColumn("status")
			?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
	}

	async function generateMultipleLeads() {
		if (!bulkAddLeads) return
		await bulkAddLeads(JSON_LEADS as Lead[])
		toast.success("100 Leads has been created.")
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-3">
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
					{/* Filter by status */}
					<Popover>
						<PopoverTrigger asChild>
							<Button disabled={isLoading} variant="outline">
								<FilterIcon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								Status
								{selectedStatuses.length > 0 && (
									<span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
										{selectedStatuses.length}
									</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto min-w-36 p-3" align="start">
							<div className="space-y-3">
								<div className="text-muted-foreground text-xs font-medium">
									Filters
								</div>
								<div className="space-y-3">
									{['new', 'converted'].map((value, i) => (
										<div key={value} className="flex items-center gap-2">
											<Checkbox
												id={`${id}-${i}`}
												checked={selectedStatuses.includes(value)}
												onCheckedChange={(checked: boolean) =>
													handleStatusChange(checked, value)
												}
											/>
											<Label
												htmlFor={`${id}-${i}`}
												className="flex grow justify-between gap-2 font-normal"
											>
												{value}{" "}
												<span className="text-muted-foreground ms-2 text-xs">
													{statusCounts.get(value)}
												</span>
											</Label>
										</div>
									))}
								</div>
							</div>
						</PopoverContent>
					</Popover>
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
				<div className="flex items-center gap-3">
					{/* Delete button */}
					{table.getSelectedRowModel().rows.length > 0 && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button disabled={isLoading} className="ml-auto" variant="outline">
									<TrashIcon
										className="-ms-1 opacity-60"
										size={16}
										aria-hidden="true"
									/>
									Delete
									<span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
										{table.getSelectedRowModel().rows.length}
									</span>
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
									<div
										className="flex size-9 shrink-0 items-center justify-center rounded-full border"
										aria-hidden="true"
									>
										<CircleAlertIcon className="opacity-80" size={16} />
									</div>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete{" "}
											{table.getSelectedRowModel().rows.length} selected{" "}
											{table.getSelectedRowModel().rows.length === 1
												? "row"
												: "rows"}
											.
										</AlertDialogDescription>
									</AlertDialogHeader>
								</div>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleDeleteRows}>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
					{/* Add user button */}
					{leads && leads?.length < 100 && (
						<Button
							isLoading={isLoading}
							variant="outline"
							onClick={generateMultipleLeads}
							className="ml-auto">
							<PlusIcon
								className="-ms-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							Generate 100 Leads
						</Button>
					)}
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button isLoading={isLoading} className="ml-auto">
								<PlusIcon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								Add Lead
							</Button>
						</SheetTrigger>
						<SheetContent className="w-[40%] sm:max-w-none">
							<LeadHandler setOpen={setOpen} />
						</SheetContent>

					</Sheet>
				</div>
			</div>

			{/* Table */}
			<TableTanstack isLoading={!!isLoading} table={table} />

			{/* Pagination */}
			<PaginationTanstack table={table} />
		</div>
	)
}