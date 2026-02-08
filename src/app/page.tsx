"use client";

import { IngestModal } from "@/components/knowledge-base/IngestModal";
import { BookList } from "@/components/knowledge-base/BookList";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearKnowledgeBase } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export default function Home() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const clearMutation = useMutation({
    mutationFn: clearKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Knowledge Base Cleared",
        description: "All books have been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear knowledge base.",
        variant: "destructive",
      });
    },
  });

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Books
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete All Books?</DialogTitle>
                    <DialogDescription>
                      This action receives <strong>NO UNDO</strong>. It will permanently delete all books and embeddings from the system.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => clearMutation.mutate()}
                      disabled={clearMutation.isPending}
                    >
                      {clearMutation.isPending ? "Deleting..." : "Yes, Delete All"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl">
        <BookList />
      </div>
    </div>
  );
}
