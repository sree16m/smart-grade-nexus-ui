import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EvaluationEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

export function EvaluationEditor({ value, onChange, error }: EvaluationEditorProps) {
    return (
        <div className="flex flex-col h-full space-y-2">
            <Label htmlFor="json-editor" className="text-sm font-medium">
                Request Body (JSON)
            </Label>
            <div className="flex-1 relative">
                <Textarea
                    id="json-editor"
                    className="font-mono text-xs h-full w-full resize-none p-4"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                />
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-destructive/10 text-destructive text-xs p-2 rounded border border-destructive/20">
                        Invalid JSON: {error}
                    </div>
                )}
            </div>
        </div>
    );
}
