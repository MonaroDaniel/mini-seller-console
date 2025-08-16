import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
	flexRender,
	type Table as TableType,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Skeleton } from "../ui/skeleton"

interface TableTanstackProps {
	table: TableType<any>
	isLoading: boolean
}

export function TableTanstack({ table, isLoading }: TableTanstackProps) {
	const columns = table.getAllColumns()
	return (
		<div className="bg-background overflow-hidden rounded-md border">
			<Table className="table-fixed">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										style={{ width: `${header.getSize()}px` }}
										className="h-11"
									>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<div
												className={cn(
													header.column.getCanSort() &&
													"flex h-full cursor-pointer items-center justify-between gap-2 select-none"
												)}
												onClick={header.column.getToggleSortingHandler()}
												onKeyDown={(e) => {
													// Enhanced keyboard handling for sorting
													if (
														header.column.getCanSort() &&
														(e.key === "Enter" || e.key === " ")
													) {
														e.preventDefault()
														header.column.getToggleSortingHandler()?.(e)
													}
												}}
												tabIndex={header.column.getCanSort() ? 0 : undefined}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
												{{
													asc: (
														<ChevronUpIcon
															className="shrink-0 opacity-60"
															size={16}
															aria-hidden="true"
														/>
													),
													desc: (
														<ChevronDownIcon
															className="shrink-0 opacity-60"
															size={16}
															aria-hidden="true"
														/>
													),
												}[header.column.getIsSorted() as string] ?? null}
											</div>
										) : (
											flexRender(
												header.column.columnDef.header,
												header.getContext()
											)
										)}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{isLoading
						? Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								{table.getAllColumns().map((col) => (
									<TableCell key={col.id}>
										<Skeleton className="h-[20px] w-[80%] rounded-lg" />
									</TableCell>
								))}
							</TableRow>
						))
						: table.getRowModel().rows.length
							? table.getRowModel().rows.map((row) => (
								<TableRow className="h-16" key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
							: (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
				</TableBody>
			</Table>
		</div>
	)
}