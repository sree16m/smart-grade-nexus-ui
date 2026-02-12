"use client";

import { useState, useRef, useEffect } from "react";
import { queryTextbook } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface Message {
    role: "user" | "bot";
    content: string;
    supplement?: string;
    citations?: string[];
    timestamp: Date;
}

interface TextbookChatProps {
    textbookId: string;
    bookName: string;
    externalQuery?: { text: string; id: number } | null;
}

export function TextbookChat({ textbookId, bookName, externalQuery }: TextbookChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "bot",
            content: `Hello! I'm your Nexus Scholar assistant. I've indexed **${bookName}**. How can I help you explore it today?`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: (q: string) => queryTextbook(textbookId, q),
        onSuccess: (data) => {
            const botMessage: Message = {
                role: "bot",
                content: data.answer || (typeof data === 'string' ? data : "I'm sorry, I couldn't generate a clear answer."),
                supplement: data.academic_supplement,
                citations: data.citations,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        },
        onError: (error: any) => {
            const is500 = error.response?.status === 500;
            const errorMsg = is500
                ? "The textbook indexing may have expired on the server. Please try re-uploading the book."
                : (error.message || "Something went wrong while querying the textbook.");

            toast({
                title: is500 ? "Textbook Expired" : "Query Failed",
                description: errorMsg,
                variant: "destructive",
            });

            const botErrorMessage: Message = {
                role: "bot",
                content: `⚠️ **Unable to process query.** ${errorMsg}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botErrorMessage]);
        },
    });

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride || input.trim();
        if (!textToSend || mutation.isPending) return;

        const userMessage: Message = {
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        if (!textOverride) setInput("");
        mutation.mutate(textToSend);
    };

    useEffect(() => {
        if (externalQuery) {
            handleSend(externalQuery.text);
        }
    }, [externalQuery]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Nexus Scholar Chat</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Connection
                </div>
            </div>

            {/* Message Area */}
            <ScrollArea className="flex-1 p-4 space-y-4">
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}>
                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted/80 text-foreground rounded-tl-none border border-border/50"
                                }`}>
                                {msg.content}

                                {msg.supplement && (
                                    <div className="mt-2 pt-2 border-t border-primary/10">
                                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70 flex items-center gap-1">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            Academic Supplement
                                        </p>
                                        <p className="text-xs opacity-90 leading-relaxed italic">
                                            {msg.supplement}
                                        </p>
                                    </div>
                                )}

                                {msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {msg.citations.map((cite, i) => (
                                            <span key={i} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                                {cite}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {mutation.isPending && (
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-muted/80 text-foreground rounded-2xl rounded-tl-none border border-border/50 px-4 py-3 flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs italic opacity-70 italic font-medium">Scholar is reading...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-muted/10">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about this textbook..."
                        className="flex-1 shadow-none border-muted focus-visible:ring-primary h-10 px-4"
                        disabled={mutation.isPending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || mutation.isPending}
                        className="h-10 w-10 shrink-0"
                    >
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Answers are strictly based on the content of the textbook.
                </p>
            </div>
        </div>
    );
}
