"use client"

import { useState } from "react";
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
            toast({
                title: "Success",
                description: "Book ingested successfully.",
            });
            setOpen(false);
            reset();
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
            </DialogContent>
        </Dialog>
    );
}
