import { Button } from "@/components/ui/button";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LeadSchema, type LeadForm } from "./_schema";
import { useContext } from "react";
import { LeadContext } from "@/context/lead-context";
import { toast } from "sonner";

interface LeadHandlerProps {
	setOpen: (value: boolean) => void
	id?: string
}

export function LeadHandler({ setOpen, id }: LeadHandlerProps) {
	const context = useContext(LeadContext)
	const leads = context?.leads
	const addLead = context?.addLead
	const updateLead = context?.updateLead
	const isLoading = context?.isLoading

	const foundedLead = leads?.find(item => item.id === id)

	const form = useForm<LeadForm>({
		resolver: zodResolver(LeadSchema),
		mode: 'onChange',
		defaultValues: {
			name: foundedLead?.name || "",
			company: foundedLead?.company || "",
			email: foundedLead?.email || "",
			source: foundedLead?.source || "",
			score: foundedLead?.score || 0,
		},
	})

	async function onSubmit(formData: LeadForm) {
		if (!id) {
			if (!addLead) return
			await addLead({
				...formData,
				id: new Date().toISOString(),
				status: 'new',
			})
			setOpen(false)
			toast.success("Lead has been created.")
			return
		}
		
		if (!updateLead) return
		await updateLead({
			...formData,
			id,
			status: foundedLead?.status || 'new',
		})
		setOpen(false)
		toast.success("Lead has been edited.")
	}

	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">{!id ? 'Create' : 'Edit'} lead</SheetTitle>
				<SheetDescription>
					{id && 'Make changes to lead here. Click save when done.'}
					{!id && 'Create a lead here. Click create when done.'}
				</SheetDescription>
			</SheetHeader>
			<Form {...form}>
				<form
					id="submit-lead"
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4 p-8"
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="col-span-6">
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										placeholder="Write the lead name..."
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Company */}
					<FormField
						control={form.control}
						name="company"
						render={({ field }) => (
							<FormItem className="col-span-6">
								<FormLabel>Company</FormLabel>
								<FormControl>
									<Input placeholder="Write the company..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Email */}
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="col-span-6">
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="Write the email..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Source */}
					<FormField
						control={form.control}
						name="source"
						render={({ field }) => (
							<FormItem className="col-span-6">
								<FormLabel>Source</FormLabel>
								<FormControl>
									<Input placeholder="Write the lead source..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Score */}
					<FormField
						control={form.control}
						name="score"
						render={({ field }) => (
							<FormItem className="col-span-6">
								<FormLabel>Score</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="Score 0-100"
										{...field}
										{...form.register("score", { valueAsNumber: true })}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>
			<SheetFooter>
				<Button
					form="submit-lead"
					type="submit"
					isLoading={isLoading}
				>
					{!id && 'Create'}
					{id && 'Save'}
				</Button>
				<SheetClose asChild>
					<Button
						isLoading={isLoading}
						variant="outline">Close</Button>
				</SheetClose>
			</SheetFooter>
		</>
	)
}