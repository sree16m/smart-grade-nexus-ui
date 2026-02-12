"use client"

import { Book, deleteBook } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, BookOpen, ExternalLink, Globe } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";

interface BookCardProps {
    book: Book;
}

export function BookCard({ book }: BookCardProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: deleteBook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
            toast({
                title: "Book deleted",
                description: `${book.book_name || book.filename} has been removed from the knowledge base.`,
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to delete the book.",
                variant: "destructive",
            });
            console.error(error);
        },
    });

    const handleDelete = () => {
        const identifier = book.filename || book.book_name || "";
        mutation.mutate(identifier);
    };

    // Generate a consistent gradient based on subject (simple hash-like logic or random fallback)
    const gradients = [
        "from-blue-500 to-cyan-400",
        "from-purple-500 to-pink-400",
        "from-orange-500 to-amber-400",
        "from-emerald-500 to-teal-400",
    ];
    const subjectHash = book.subject ? book.subject.length % gradients.length : 0;
    const gradient = gradients[subjectHash];

    return (
        <Card className="h-full flex flex-col justify-between group hover:shadow-lg transition-all duration-300 border-t-0 overflow-hidden">
            {/* Decorative Spine/Header */}
            <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl leading-tight line-clamp-2" title={book.book_name || book.filename || "Book"}>
                        {book.book_name || book.filename}
                    </CardTitle>
                </div>
                <CardDescription className="flex flex-wrap gap-2 mt-2">
                    {book.subject && (
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                            {book.subject}
                        </Badge>
                    )}
                    {book.class_level && (
                        <Badge variant="outline">
                            Class {book.class_level}
                        </Badge>
                    )}
                </CardDescription>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground space-y-2 flex-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded-md">
                        <span className="block font-semibold text-foreground">Board</span>
                        {book.board || "N/A"}
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md">
                        <span className="block font-semibold text-foreground">Year</span>
                        {book.academic_year || "N/A"}
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md col-span-2">
                        <span className="block font-semibold text-foreground">Semester</span>
                        {book.semester || "N/A"}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="justify-between border-t bg-muted/20 py-3 gap-2">
                <Link href={`/textbooks/${book.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors h-8">
                        <BookOpen className="h-3.5 w-3.5" />
                        Open Explorer
                    </Button>
                </Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Book</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{book.book_name || book.filename}</strong>? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={handleDelete} disabled={mutation.isPending}>
                                {mutation.isPending ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
}
