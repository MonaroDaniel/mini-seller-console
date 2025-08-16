import z from "zod";

export const LeadSchema = z.object({
  name: z.string().min(1, "Please enter the name"),
  company: z.string().min(1, "Please enter the company"),
  email: z.string().email("Please enter a valid email address"),
  source: z.string().min(1, "Please enter the source"),
  score: z
    .number({message: 'Please enter the score'})
    .min(0, { message: "Score must be at least 0" })
    .max(100, { message: "Score cannot exceed 100" }),
});

export type LeadForm = z.infer<typeof LeadSchema>;
