"use client";

import { IngestModal } from "@/components/knowledge-base/IngestModal";
import { BookList } from "@/components/knowledge-base/BookList";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b pt-12 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Knowledge Base
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage the educational content and textbooks used for AI grading and analysis.
              </p>
            </div>

            <div className="flex gap-3">
              <IngestModal />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <BookList />
      </div>
    </div>
  );
}
