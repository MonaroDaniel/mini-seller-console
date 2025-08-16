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
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Pencil, ThumbsUp } from "lucide-react"
import { useContext, useState } from "react"
import { LeadHandler } from "./handler"
import { LeadContext, type Lead } from "@/context/lead-context"
import { toast } from "sonner"

interface LeadActionsProps {
      data: Lead
}

export function LeadActions({ data }: LeadActionsProps) {
      const context = useContext(LeadContext)
      const convertLead = context?.convertLead

      const [open, setOpen] = useState(false)

      async function handleConvertLead(id: string) {
            if (!convertLead) return
            await convertLead(id)
            toast.success("Lead has been converted.")
      }

      return (
            <div className="flex gap-2 items-center">
                  <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>

                              <Button size="icon" variant="outline">
                                    <Pencil />
                              </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[40%] sm:max-w-none">
                              <LeadHandler
                                    id={data.id}
                                    setOpen={setOpen}
                              />
                        </SheetContent>
                  </Sheet>

                  {data.status === 'new' && (
                        <AlertDialog>
                              <AlertDialogTrigger asChild>
                                    <Button className="my-2" size="icon" variant="success">
                                          <ThumbsUp />
                                    </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                    <AlertDialogHeader>
                                          <AlertDialogTitle>Do you want to convert this lead?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                                Converting this lead will create a new opportunity.
                                                Please make sure you are ready to proceed before confirming.
                                          </AlertDialogDescription>

                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleConvertLead(data.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                              </AlertDialogContent>
                        </AlertDialog>
                  )}

            </div>
      )
}