"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPendingAnswerSheets, EvaluationRequest } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OCRModalProps {
    onSelect: (data: EvaluationRequest) => void;
}

export function OCRModal({ onSelect }: OCRModalProps) {
    const [open, setOpen] = useState(false);
    const { data: sheets, isLoading, isError } = useQuery({
        queryKey: ["pending-sheets"],
        queryFn: fetchPendingAnswerSheets,
        enabled: open, // Only fetch when modal is open
    });

    const handleSelect = (sheet: any) => { // Type 'any' for now as the OCR API response might vary, ideally strict typed
        onSelect(sheet);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Load from OCR
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Pending Answer Sheet</DialogTitle>
                    <DialogDescription>
                        Select an answer sheet from the OCR service to import for analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : isError ? (
                        <div className="flex h-full items-center justify-center text-destructive">
                            Failed to load answer sheets.
                        </div>
                    ) : !sheets || sheets.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No pending answer sheets found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sheets.map((sheet: any) => (
                                    <TableRow key={sheet.id || Math.random()} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelect(sheet)}>
                                        <TableCell className="font-medium">{sheet.student_id || "Unknown"}</TableCell>
                                        <TableCell>{sheet.exam_details?.subject || "N/A"}</TableCell>
                                        <TableCell>{sheet.exam_details?.class_level || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">Pending Evaluation</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSelect(sheet); }}>
                                                Load
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
