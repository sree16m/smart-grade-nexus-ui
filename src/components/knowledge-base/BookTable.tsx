"use client"

import { Book, deleteBook } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

interface BookTableProps {
    books: Book[];
}

export function BookTable({ books }: BookTableProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: deleteBook,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
            toast({
                title: "Book deleted",
                description: `${variables} has been removed from the knowledge base.`,
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

    const handleDelete = (bookName: string) => {
        mutation.mutate(bookName);
    };

    if (books.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No books found in the knowledge base.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-md overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Book Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Board</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {books.map((book) => (
                        <TableRow key={book.book_name}>
                            <TableCell className="font-medium">{book.book_name}</TableCell>
                            <TableCell>
                                {book.subject && <Badge variant="secondary">{book.subject}</Badge>}
                            </TableCell>
                            <TableCell>{book.student_class || "-"}</TableCell>
                            <TableCell>{book.board || "-"}</TableCell>
                            <TableCell>{book.school || "-"}</TableCell>
                            <TableCell>{book.semester || "-"}</TableCell>
                            <TableCell className="text-right">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Book</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete <strong>{book.book_name}</strong>? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(book.book_name)}
                                                disabled={mutation.isPending}
                                            >
                                                {mutation.isPending ? "Deleting..." : "Delete"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
