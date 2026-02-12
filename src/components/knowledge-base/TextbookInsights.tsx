"use client";

import { Book } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, School, Calendar, Layers, Info } from "lucide-react";

interface TextbookInsightsProps {
    book: Book;
    onAction: (query: string) => void;
}

export function TextbookInsights({ book, onAction }: TextbookInsightsProps) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Book Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 transition-colors hover:bg-muted">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Subject</p>
                            <p className="text-sm font-semibold">{book.subject}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 transition-colors hover:bg-muted">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                            <Layers className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Class Level</p>
                            <p className="text-sm font-semibold">Grade {book.class_level}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 transition-colors hover:bg-muted">
                        <div className="p-2 bg-purple-500/10 rounded-md">
                            <School className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Board</p>
                            <p className="text-sm font-semibold">{book.board || "N/A"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 transition-colors hover:bg-muted">
                        <div className="p-2 bg-orange-500/10 rounded-md">
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Academic Year</p>
                            <p className="text-sm font-semibold">{book.academic_year || "N/A"}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3 px-1">Quick Actions</p>
                    <div className="flex flex-col gap-2">
                        <Badge
                            variant="outline"
                            className="justify-start py-2 px-3 border-dashed hover:border-primary hover:text-primary transition-all cursor-pointer"
                            onClick={() => onAction("Can you provide a summary of all chapters in this textbook?")}
                        >
                            Summarize Chapters
                        </Badge>
                        <Badge
                            variant="outline"
                            className="justify-start py-2 px-3 border-dashed hover:border-primary hover:text-primary transition-all cursor-pointer"
                            onClick={() => onAction("What are the key definitions and core concepts covered in this book?")}
                        >
                            Key Definitions
                        </Badge>
                        <Badge
                            variant="outline"
                            className="justify-start py-2 px-3 border-dashed hover:border-primary hover:text-primary transition-all cursor-pointer"
                            onClick={() => onAction("Based on the textbook content, suggest 5 practice questions to test my knowledge.")}
                        >
                            Practice Questions
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
