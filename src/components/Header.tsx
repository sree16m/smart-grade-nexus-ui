import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Beaker } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        SmartGrade Discovery
                    </span>
                </div>
                <nav className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors">
                            <BookOpen className="h-4 w-4" />
                            Knowledgebase Management
                        </Button>
                    </Link>
                    <Link href="/subject-evaluation">
                        <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors">
                            <Beaker className="h-4 w-4" />
                            Subject Evaluation
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
