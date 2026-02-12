"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { evaluateSheet, EvaluationRequest, EvaluationResponse, fetchPendingAnswerSheets } from "@/lib/api";
import { EvaluationEditor } from "@/components/subject-evaluation/EvaluationEditor";
import { EvaluationResult } from "@/components/subject-evaluation/EvaluationResult";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Play, FileText, Code, Loader2, ArrowLeft } from "lucide-react";

const SAMPLE_REQUEST: EvaluationRequest = {
    answer_sheet_id: "as_sample_001",
    qp_id: "qp_sample_001",
    status: "pending evaluation",
    exam_details: {
        subject: "Science",
        board: "CBSE",
        class_level: 10,
        exam_code: "SCI10-001"
    },
    student_details: {
        name: "Sam Student",
        roll_no: "101",
        class: "10",
        section: "A",
        subject: "Science",
        date: "2024-03-20",
        school: "Example High School"
    },
    grading_summary: {},
    responses: [
        {
            q_no: 1,
            question_context: {
                text_primary: { en: "Explain the process of photosynthesis." },
                type: "descriptive",
                max_marks: 5
            },
            student_answer: {
                text: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll."
            }
        }
    ]
};

export default function SubjectEvaluation() {
    const [view, setView] = useState<"dashboard" | "editor">("dashboard");
    const [activeTab, setActiveTab] = useState("visual");
    const [inputJson, setInputJson] = useState(JSON.stringify(SAMPLE_REQUEST, null, 2));
    const [result, setResult] = useState<EvaluationResponse | null>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const { toast } = useToast();

    // Query for pending sheets (reused from OCRModal logic)
    const { data: sheets, isLoading: isLoadingSheets, isError: isSheetsError, refetch: refetchSheets } = useQuery({
        queryKey: ["pending-sheets"],
        queryFn: fetchPendingAnswerSheets,
        enabled: view === "dashboard", // Only fetch in dashboard view
    });

    const mutation = useMutation({
        mutationFn: evaluateSheet,
        onSuccess: (data) => {
            setResult(data);
            setActiveTab("visual"); // Ensure we switch to visual tab on success
            toast({
                title: "Analysis Complete",
                description: "Answer sheet has been graded successfully.",
            });
        },
        onError: (error: any) => {
            console.error("Evaluation Error:", error);
            // Construct a useful error message from 422 validation errors if available
            let errorDesc = "Failed to evaluate the answer sheet.";
            if (error.response?.data?.detail) {
                // If detail is array (Pydantic), stringify it
                if (Array.isArray(error.response.data.detail)) {
                    errorDesc = error.response.data.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join('\n');
                } else {
                    errorDesc = String(error.response.data.detail);
                }
            }

            toast({
                title: "Evaluation Failed",
                description: errorDesc,
                variant: "destructive",
            });
        },
    });

    const handleInputChange = (value: string) => {
        setInputJson(value);
        try {
            JSON.parse(value);
            setJsonError(null);
        } catch (e: any) {
            setJsonError(e.message);
        }
    };

    const handleLoadSample = () => {
        setInputJson(JSON.stringify(SAMPLE_REQUEST, null, 2));
        setResult(null);
        setJsonError(null);
        setView("editor");
        toast({ title: "Sample Loaded", description: "Sample answer sheet loaded into editor." });
    };

    const handleLoadFromOCR = (data: any) => {
        // Construct EvaluationRequest from OCR data
        const formattedData: EvaluationRequest = {
            answer_sheet_id: data.id || "manual_001",
            qp_id: data.qp_id || "qp_001",
            status: "pending evaluation",
            student_details: {
                name: data.student_name || "Unknown Student",
                roll_no: data.roll_no || "N/A",
                class: data.exam_details?.class || "N/A",
                section: "A",
                subject: data.exam_details?.subject || "N/A",
                date: new Date().toISOString().split('T')[0],
                school: "N/A"
            },
            exam_details: {
                subject: data.exam_details?.subject || "N/A",
                board: data.exam_details?.board || "CBSE",
                class_level: data.exam_details?.class_level || data.exam_details?.class || 10,
                exam_code: data.exam_details?.exam_code || "N/A"
            },
            grading_summary: data.grading_summary || {},
            responses: (data.responses || []).map((res: any) => ({
                q_no: res.q_no,
                question_context: {
                    ...res.question_context,
                    text_primary: typeof res.question_context?.text_primary === 'string'
                        ? { en: res.question_context.text_primary }
                        : res.question_context?.text_primary
                },
                student_answer: {
                    ...res.student_answer,
                    text: res.student_answer?.text || null
                }
            }))
        };

        setInputJson(JSON.stringify(formattedData, null, 2));
        setResult(null);
        setJsonError(null);
        setView("editor");
        toast({ title: "Answer Sheet Loaded", description: "Ready for evaluation." });
    };

    const handleAnalyze = () => {
        try {
            const data = JSON.parse(inputJson);
            mutation.mutate(data);
        } catch (e) {
            toast({
                title: "Invalid JSON",
                description: "Please check the input JSON syntax.",
                variant: "destructive",
            });
        }
    };

    const handleBackToDashboard = () => {
        setView("dashboard");
        refetchSheets();
    };

    if (view === "dashboard") {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pending Evaluations</h1>
                        <p className="text-muted-foreground mt-1">Select an answer sheet to begin grading.</p>
                    </div>
                    <Button variant="outline" onClick={handleLoadSample}>
                        Load Sample Data
                    </Button>
                </div>

                <div className="border rounded-md shadow-sm bg-background">
                    <div className="p-4 border-b bg-muted/5">
                        <h2 className="font-semibold flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            Pending Evaluation Queue
                        </h2>
                    </div>

                    {isLoadingSheets ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : isSheetsError ? (
                        <div className="p-12 text-center text-destructive">
                            Failed to load pending answer sheets.
                        </div>
                    ) : !sheets || sheets.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No answer sheets pending evaluation.
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
                                    <TableRow key={sheet.id || Math.random()} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{sheet.student_id || sheet.student_name || "Unknown"}</TableCell>
                                        <TableCell>{sheet.exam_details?.subject || "N/A"}</TableCell>
                                        <TableCell>{sheet.exam_details?.class_level || sheet.exam_details?.class || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending Evaluation</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handleLoadFromOCR(sheet)}>
                                                Evaluate
                                                <Play className="ml-2 h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-muted/10">
            {/* Toolbar */}
            <div className="border-b bg-background px-4 py-2 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleBackToDashboard} className="mr-1 h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border mr-1" />

                    <div className="p-1.5 bg-secondary rounded-md">
                        <Code className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold leading-none">Evaluation Editor</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Edit JSON and run analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleAnalyze}
                        disabled={!!jsonError || mutation.isPending}
                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                    >
                        {mutation.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Play className="mr-2 h-3 w-3" />}
                        Run Analysis
                    </Button>
                </div>
            </div>

            {/* Split View Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Input */}
                <div className="w-1/2 flex flex-col border-r bg-background">
                    <div className="px-4 py-2 border-b bg-muted/5 flex justify-between items-center">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Input (JSON)</span>
                        {jsonError && <span className="text-xs text-destructive font-medium">Invalid JSON</span>}
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <EvaluationEditor
                            value={inputJson}
                            onChange={handleInputChange}
                            error={jsonError}
                        />
                    </div>
                </div>

                {/* Right Panel: Output */}
                <div className="w-1/2 flex flex-col bg-muted/5">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-4 py-2 border-b bg-background flex justify-between items-center">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Output</span>
                            <TabsList className="h-7 w-auto">
                                <TabsTrigger value="visual" className="text-xs h-6 px-3">
                                    <FileText className="mr-1.5 h-3 w-3" />
                                    Rendered
                                </TabsTrigger>
                                <TabsTrigger value="json" className="text-xs h-6 px-3">
                                    <Code className="mr-1.5 h-3 w-3" />
                                    JSON
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col relative">
                            {mutation.isPending ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-all">
                                    <div className="bg-background shadow-xl border rounded-lg p-6 flex flex-col items-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                                        <h3 className="font-semibold text-lg">Analyzing...</h3>
                                        <p className="text-sm text-muted-foreground">AI is grading the answer sheet</p>
                                    </div>
                                </div>
                            ) : null}

                            {!result && !mutation.isPending && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-background/50">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                        <Play className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="font-medium">Ready to Analyze</p>
                                    <p className="text-sm opacity-70 mt-1 max-w-xs text-center">
                                        Click "Run Analysis" to see results here.
                                    </p>
                                </div>
                            )}

                            {result && (
                                <div className="h-full bg-background rounded-lg border shadow-sm overflow-hidden flex flex-col">
                                    <TabsContent value="visual" className="relative flex-1 mt-0 h-full w-full p-0">
                                        <div className="absolute inset-0 overflow-hidden flex flex-col">
                                            <EvaluationResult result={result} />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="json" className="relative flex-1 mt-0 h-full w-full p-0">
                                        <div className="absolute inset-0 overflow-hidden flex flex-col">
                                            <textarea
                                                className="flex-1 w-full p-4 font-mono text-xs bg-muted/20 resize-none focus:outline-none"
                                                readOnly
                                                value={JSON.stringify(result, null, 2)}
                                            />
                                        </div>
                                    </TabsContent>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
