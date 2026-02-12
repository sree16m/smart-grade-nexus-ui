"use client"

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingestBook } from "@/lib/api";
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
    class_level?: string;
    academic_year: string;
    semester: string;
}

export function IngestModal() {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<IngestFormData>({
        defaultValues: {
            academic_year: "2025-26",
            semester: "1",
            board: "CBSE"
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
            if (data.class_level) formData.append("class_level", data.class_level);
            formData.append("academic_year", data.academic_year);
            formData.append("semester", data.semester);

            return ingestBook(formData);
        },
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
            toast({
                title: "Upload Successful",
                description: `"${variables.book_name}" has been uploaded and is being processed.`
            });
            setOpen(false);
            reset();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to upload book. Please try again.",
                variant: "destructive",
            });
            console.error(error);
        },
    });

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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                {...register("subject", { required: true })}
                                placeholder="e.g. Science"
                            />
                            {errors.subject && <span className="text-xs text-red-500">Required</span>}
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="class_level">Class *</Label>
                            <Input id="class_level" {...register("class_level", { required: true })} placeholder="e.g. 10" />
                            {errors.class_level && <span className="text-xs text-red-500">Required</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="academic_year">Academic Year *</Label>
                            <Input id="academic_year" {...register("academic_year", { required: true })} placeholder="2025-26" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="semester">Semester *</Label>
                            <Input id="semester" {...register("semester", { required: true })} placeholder="1" />
                        </div>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="board">Board</Label>
                        <Input id="board" {...register("board")} placeholder="e.g. CBSE" />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={mutation.isPending} className="w-full">
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Start Ingestion
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
