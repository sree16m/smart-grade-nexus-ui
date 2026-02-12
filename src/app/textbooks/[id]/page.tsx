"use client";

import { useQuery } from "@tanstack/react-query";
import { getTextbookDetails } from "@/lib/api";
import { TextbookChat } from "@/components/knowledge-base/TextbookChat";
import { TextbookInsights } from "@/components/knowledge-base/TextbookInsights";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, BookOpen, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TextbookDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: book, isLoading, isError, refetch } = useQuery({
        queryKey: ["textbook", id],
        queryFn: () => getTextbookDetails(id),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Summoning Nexus Scholar...</p>
            </div>
        );
    }

    if (isError || !book) {
        return (
            <div className="container mx-auto px-4 py-12 text-center max-w-md">
                <div className="p-6 border-2 border-dashed rounded-2xl bg-muted/5">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Explorer Offline</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        We couldn't retrieve the details for this textbook. It might have been deleted or the connection was lost.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => refetch()} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Connection
                        </Button>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-muted/5 overflow-hidden">
            {/* Contextual Header */}
            <header className="px-6 py-4 bg-background border-b z-20 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <div className="h-8 w-px bg-border mx-1" />
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none tracking-tight">{book.book_name}</h1>
                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 uppercase font-medium tracking-widest leading-none">
                                <span className="text-primary">•</span> Knowledge Explorer
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Source PDF
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden container mx-auto px-6 py-6 gap-6 max-w-[1600px]">
                {/* Insights Sidebar (Left) */}
                <aside className="w-80 flex flex-col gap-6 shrink-0 hidden lg:flex">
                    <TextbookInsights book={book} />
                </aside>

                {/* Explorer Chat (Center) */}
                <section className="flex-1 flex flex-col min-w-0">
                    <TextbookChat textbookId={id} bookName={book.book_name} />
                </section>
            </main>
        </div>
    );
}
