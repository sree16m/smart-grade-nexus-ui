"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Upload, Loader2 } from "lucide-react";

interface IngestFormData {
    file: FileList;
    book_name: string;
    subject: string;
    board?: string;
    school?: string;
    student_class?: string;
    semester?: string;
}

export function IngestModal() {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<IngestFormData>();
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
