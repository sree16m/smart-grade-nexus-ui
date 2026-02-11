"use client"

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingestBook, getIngestStatus, cancelIngest } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Cpu } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { XCircle, CheckCircle2, AlertCircle } from "lucide-react";

interface IngestFormData {
    file: FileList;
    book_name: string;
    subject: string;
    board?: string;
    school?: string;
    student_class?: string;
    semester?: string;
    ingestion_mode: string;
}

export function IngestModal() {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<IngestFormData>({
        defaultValues: {
            ingestion_mode: "ai"
        }
    });
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: async (data: IngestFormData) => {
            const formData = new FormData();
            formData.append("file", data.file[0]);
            formData.append("book_name", data.book_name);
            formData.append("subject", data.subject);
            if (data.board) formData.append("board", data.board);
            if (data.school) formData.append("school", data.school);
            if (data.student_class) formData.append("student_class", data.student_class);
            if (data.semester) formData.append("semester", data.semester);
            formData.append("ingestion_mode", data.ingestion_mode);

            return ingestBook(formData);
        },
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
            setPollingBookName(variables.book_name);
            setIngestStatus({ status: "processing", current_page: 0, total_pages: 0 });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to ingest book. Please try again.",
                variant: "destructive",
            });
            console.error(error);
        },
    });

    const [pollingBookName, setPollingBookName] = useState<string | null>(null);
    const [ingestStatus, setIngestStatus] = useState<any>(null);

    useEffect(() => {
        let interval: any;
        if (pollingBookName) {
            interval = setInterval(async () => {
                try {
                    const res = await getIngestStatus(pollingBookName);
                    if (res.status === "success" && res.data) {
                        setIngestStatus(res.data);
                        if (res.data.status === "completed" || res.data.status === "failed") {
                            setPollingBookName(null);
                            queryClient.invalidateQueries({ queryKey: ["books"] });
                            if (res.data.status === "completed") {
                                toast({ title: "Ingestion Complete", description: `"${pollingBookName}" has been successfully indexed.` });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [pollingBookName, queryClient, toast]);

    const handleCancel = async () => {
        if (!pollingBookName) return;
        try {
            await cancelIngest(pollingBookName);
            toast({ title: "Cancellation Requested", description: "Stopping ingestion process..." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to cancel ingestion.", variant: "destructive" });
        }
    };

    const onSubmit = (data: IngestFormData) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Book
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ingest New Book</DialogTitle>
                    <DialogDescription>
                        Upload a PDF document to add to the knowledge base.
                    </DialogDescription>
                </DialogHeader>
                {ingestStatus ? (
                    <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                            {ingestStatus.status === "processing" ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : ingestStatus.status === "completed" ? (
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : ingestStatus.status === "failed" ? (
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            ) : (
                                <XCircle className="h-8 w-8 text-orange-500" />
                            )}
                            <h3 className="text-lg font-medium">
                                {ingestStatus.status === "processing" ? "Processing Book..." :
                                    ingestStatus.status === "completed" ? "Ingestion Complete" :
                                        ingestStatus.status === "failed" ? "Ingestion Failed" : "Ingestion Cancelled"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {ingestStatus.status === "processing"
                                    ? `Indexing page ${ingestStatus.current_page} of ${ingestStatus.total_pages}...`
                                    : ingestStatus.status === "completed"
                                        ? "All pages have been indexed and are ready for search."
                                        : ingestStatus.status === "failed"
                                            ? `Error: ${ingestStatus.error || "Unknown error occurred"}`
                                            : "The ingestion process was terminated."}
                            </p>
                        </div>

                        {ingestStatus.status === "processing" && (
                            <div className="space-y-2">
                                <Progress value={(ingestStatus.current_page / ingestStatus.total_pages) * 100} />
                                <p className="text-right text-xs text-muted-foreground">
                                    {Math.round((ingestStatus.current_page / ingestStatus.total_pages) * 100)}%
                                </p>
                            </div>
                        )}

                        <DialogFooter className="flex row gap-2 justify-end">
                            {ingestStatus.status === "processing" && (
                                <Button variant="outline" onClick={handleCancel} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Ingestion
                                </Button>
                            )}
                            {(ingestStatus.status === "completed" || ingestStatus.status === "failed" || ingestStatus.status === "cancelling") && (
                                <Button onClick={() => {
                                    setOpen(false);
                                    setIngestStatus(null);
                                    setPollingBookName(null);
                                    reset();
                                }}>
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="file">PDF File *</Label>
                            <Input
                                id="file"
                                type="file"
                                accept="application/pdf"
                                {...register("file", { required: true })}
                            />
                            {errors.file && <span className="text-xs text-red-500">File is required</span>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="book_name">Book Name *</Label>
                            <Input
                                id="book_name"
                                {...register("book_name", { required: true })}
                                placeholder="e.g. NCERT Science 10"
                            />
                            {errors.book_name && <span className="text-xs text-red-500">Name is required</span>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                {...register("subject", { required: true })}
                                placeholder="e.g. Science"
                            />
                            {errors.subject && <span className="text-xs text-red-500">Subject is required</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="board">Board</Label>
                                <Input id="board" {...register("board")} placeholder="e.g. CBSE" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="student_class">Class</Label>
                                <Input id="student_class" {...register("student_class")} placeholder="e.g. 10" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="school">School</Label>
                                <Input id="school" {...register("school")} placeholder="Optional" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="semester">Semester</Label>
                                <Input id="semester" {...register("semester")} placeholder="Optional" />
                            </div>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="ingestion_mode">Ingestion Mode *</Label>
                            <Controller
                                name="ingestion_mode"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="ingestion_mode">
                                            <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ai">
                                                <div className="flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 text-purple-500" />
                                                    <span>AI Mode (Smart Extraction)</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="standard">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 text-blue-500" />
                                                    <span>Standard (Fast Ingest)</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ingest
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
