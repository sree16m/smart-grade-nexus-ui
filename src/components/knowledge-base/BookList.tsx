"use client";

import { useQuery } from "@tanstack/react-query";
import { getBooks } from "@/lib/api";
import { BookTable } from "@/components/knowledge-base/BookTable";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function BookList() {
    const { data: books, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["books"],
        queryFn: () => getBooks(),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Loading knowledge base...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="mt-2">
                    Failed to load books. Please check if the backend is running.
                    <div className="mt-4">
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Available Books</h2>
                <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {books?.length || 0} Total
                </span>
            </div>
            <BookTable books={books || []} />
        </section>
    );
}
