import { EvaluationResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle, BookOpen, Target, Lightbulb, Ruler } from "lucide-react";

interface EvaluationResultProps {
    result: EvaluationResponse;
}

export function EvaluationResult({ result }: EvaluationResultProps) {
    const { evaluation_summary, responses } = result;

    return (
        <div className="flex flex-col gap-4 min-h-0 flex-1 h-full">
            {/* Score Card */}
            <Card className="bg-muted/30 shrink-0 border-primary/20">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Evaluation Result</CardTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                                {evaluation_summary.overall_feedback || "Analysis completed successfully."}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                                {evaluation_summary.total_marks_awarded} <span className="text-lg text-muted-foreground font-normal">/ {evaluation_summary.total_max_marks}</span>
                            </div>
                            <Badge variant={evaluation_summary.percentage >= 70 ? "default" : evaluation_summary.percentage >= 40 ? "secondary" : "destructive"} className="mt-1">
                                {evaluation_summary.percentage}%
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Questions List */}
            <div className="flex-1 min-h-0 rounded-md border p-4 overflow-y-auto bg-background/50">
                <div className="space-y-4">
                    {responses.map((response, index) => (
                        <Card key={index} className="overflow-hidden border-muted">
                            <CardHeader className="bg-muted/20 pb-3 pt-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="font-semibold text-sm leading-relaxed">
                                        <span className="mr-2 text-primary font-bold">Q{response.q_no}.</span>
                                        {response.question_context.text_primary.en}
                                    </div>
                                    <Badge variant="outline" className="shrink-0 bg-background">
                                        {response.student_answer.marks_awarded ?? 0} / {response.question_context.max_marks}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Student Answer */}
                                <div className="space-y-1.5">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Student Answer</div>
                                    <div className="text-sm bg-muted/30 p-3 rounded-md border border-muted/50">
                                        {response.student_answer.text || "No response provided."}
                                    </div>
                                </div>

                                {/* AI Insights Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Metadata */}
                                    {(response.student_answer.chapter || response.student_answer.topic) && (
                                        <div className="space-y-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
                                            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                                                <BookOpen className="h-3 w-3" />
                                                Reference Material
                                            </div>
                                            <div className="space-y-1">
                                                {response.student_answer.chapter && (
                                                    <div className="text-xs flex items-center gap-2">
                                                        <span className="text-muted-foreground font-medium">Chapter:</span>
                                                        <span className="font-semibold">{response.student_answer.chapter}</span>
                                                    </div>
                                                )}
                                                {response.student_answer.topic && (
                                                    <div className="text-xs flex items-center gap-2">
                                                        <span className="text-muted-foreground font-medium">Topic:</span>
                                                        <span className="font-semibold">{response.student_answer.topic}</span>
                                                    </div>
                                                )}
                                                {response.student_answer.page_number && (
                                                    <div className="text-xs flex items-center gap-2">
                                                        <span className="text-muted-foreground font-medium">Page:</span>
                                                        <Badge variant="secondary" className="text-[10px] h-4">{response.student_answer.page_number}</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Feedback & Suggestions */}
                                    {(response.student_answer.ai_feedback || response.student_answer.remedial_suggestion) && (
                                        <div className="space-y-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/20">
                                            <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                                                <Lightbulb className="h-3 w-3" />
                                                AI Feedback
                                            </div>
                                            <div className="space-y-2">
                                                {response.student_answer.ai_feedback && (
                                                    <p className="text-xs leading-relaxed text-emerald-800/90 dark:text-emerald-300">
                                                        {response.student_answer.ai_feedback}
                                                    </p>
                                                )}
                                                {response.student_answer.remedial_suggestion && (
                                                    <div className="pt-1">
                                                        <div className="text-[9px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase mb-1">Remedial Action</div>
                                                        <p className="text-xs italic text-emerald-700 dark:text-emerald-400">
                                                            "{response.student_answer.remedial_suggestion}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Correct Answer */}
                                {response.student_answer.correct_answer && !response.student_answer.is_correct && (
                                    <div className="p-3 rounded-md bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
                                        <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                                            <Target className="h-3 w-3" />
                                            Expected Answer
                                        </div>
                                        <p className="text-xs text-amber-800/90 dark:text-amber-300">
                                            {response.student_answer.correct_answer}
                                        </p>
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
