import { AnswerSheetOutput } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationResultProps {
    result: AnswerSheetOutput;
}

export function EvaluationResult({ result }: EvaluationResultProps) {

    // Calculate total score if available
    const totalScore = result.responses.reduce((sum, r) => sum + (r.student_answer.marks_awarded || 0), 0);
    const totalMaxScore = result.responses.reduce((sum, r) => sum + (r.question_context.max_marks || 0), 0);
    const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    return (
        <div className="flex flex-col gap-4 min-h-0 flex-1 h-full">
            {/* Score Card */}
            <Card className="bg-muted/30 shrink-0">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Evaluation Result</CardTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                                {result.exam_details.subject} • Class {result.exam_details.class || result.exam_details.class_level} • {result.exam_details.board}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                                {totalScore} <span className="text-lg text-muted-foreground font-normal">/ {totalMaxScore}</span>
                            </div>
                            <Badge variant={percentage >= 70 ? "default" : percentage >= 40 ? "secondary" : "destructive"}>
                                {percentage}%
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Questions List */}
            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-y-auto">
                <div className="space-y-4">
                    {result.responses.map((response, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="bg-muted/20 pb-3 pt-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="font-semibold text-sm">
                                        <span className="mr-2 text-muted-foreground">Q{response.q_no}.</span>
                                        {response.question_context.text_primary.en}
                                    </div>
                                    <Badge variant="outline" className="shrink-0">
                                        {response.student_answer.marks_awarded} / {response.question_context.max_marks}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {/* Student Answer */}
                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground mb-1">Student Answer</div>
                                    <div className="text-sm bg-muted/30 p-2 rounded-md font-medium">
                                        {response.student_answer.text}
                                    </div>
                                </div>

                                {/* Feedback */}
                                {response.student_answer.feedback && (
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            AI Feedback
                                        </div>
                                        <div className="text-sm text-blue-600/90 dark:text-blue-400">
                                            {response.student_answer.feedback}
                                        </div>
                                    </div>
                                )}

                                {/* Topics */}
                                {response.topic_analysis && (
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">Topics Identified</div>
                                        <div className="flex flex-wrap gap-1">
                                            {/* Assuming topic_analysis is an object or array, adapting display logic */}
                                            {/* Ideally we should type this strictly, but for MVP visualizing any content */}
                                            {Object.entries(response.topic_analysis).map(([key, value]) => (
                                                <Badge key={key} variant="secondary" className="text-xs font-normal">
                                                    {key}: {String(value)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
