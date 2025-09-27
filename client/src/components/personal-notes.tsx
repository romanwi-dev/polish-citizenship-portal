import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  StickyNote,
  Tag,
  Calendar,
  Search
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PersonalNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: "general" | "important" | "reminder" | "question";
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function PersonalNotes({ userId = "demo-user" }: { userId?: string }) {
  const { toast } = useToast();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "general" as PersonalNote["category"],
    tags: [] as string[]
  });

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['/api/personal-notes', userId],
    queryFn: async () => {
      const response = await fetch(`/api/personal-notes/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: Partial<PersonalNote>) => {
      const response = await fetch('/api/personal-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteData, userId })
      });
      if (!response.ok) throw new Error('Failed to create note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personal-notes', userId] });
      setIsAddingNote(false);
      setNewNote({ title: "", content: "", category: "general", tags: [] });
      toast({
        title: "Note Created",
        description: "Your note has been saved successfully."
      });
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: { noteId: string; updates: Partial<PersonalNote> }) => {
      const response = await fetch(`/api/personal-notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personal-notes', userId] });
      setEditingNote(null);
      toast({
        title: "Note Updated",
        description: "Your changes have been saved."
      });
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/personal-notes/${noteId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personal-notes', userId] });
      toast({
        title: "Note Deleted",
        description: "The note has been removed."
      });
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "important":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "reminder":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "question":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredNotes = notes.filter((note: PersonalNote) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sample notes if no data
  const displayNotes = notes.length > 0 ? notes : [
    {
      id: "1",
      userId,
      title: "Questions for lawyer",
      content: "1. Timeline for archive research?\n2. Cost breakdown for translation services\n3. What if documents are missing?",
      category: "question",
      tags: ["consultation", "important"],
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01")
    },
    {
      id: "2",
      userId,
      title: "Document checklist",
      content: "✓ Birth certificate\n✓ Parents' marriage certificate\n✗ Grandfather's birth certificate (pending)\n✗ Polish army records",
      category: "important",
      tags: ["documents"],
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-02-05")
    },
    {
      id: "3",
      userId,
      title: "Next appointment",
      content: "February 15, 2024 at 2:00 PM\nBring translated documents and family photos",
      category: "reminder",
      tags: ["appointment"],
      createdAt: new Date("2024-02-08"),
      updatedAt: new Date("2024-02-08")
    }
  ];

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Personal Notes
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setIsAddingNote(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-950"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="important">Important</option>
              <option value="reminder">Reminder</option>
              <option value="question">Question</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[430px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading notes...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? "No notes found matching your search" : "No notes yet. Click 'Add Note' to create your first note."}
              </div>
            ) : (
              <div className="grid gap-3">
                {(displayNotes as PersonalNote[]).map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border bg-white dark:bg-gray-950 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{note.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(note.category)}>
                            {note.category}
                          </Badge>
                          {note.tags && note.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingNote(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {note.content}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add/Edit Note Dialog */}
      <Dialog open={isAddingNote || !!editingNote} onOpenChange={(open) => {
        if (!open) {
          setIsAddingNote(false);
          setEditingNote(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Note title..."
                value={editingNote ? editingNote.title : newNote.title}
                onChange={(e) => {
                  if (editingNote) {
                    setEditingNote({ ...editingNote, title: e.target.value });
                  } else {
                    setNewNote({ ...newNote, title: e.target.value });
                  }
                }}
                className="font-semibold"
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Write your note here..."
                value={editingNote ? editingNote.content : newNote.content}
                onChange={(e) => {
                  if (editingNote) {
                    setEditingNote({ ...editingNote, content: e.target.value });
                  } else {
                    setNewNote({ ...newNote, content: e.target.value });
                  }
                }}
                className="min-h-[200px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={editingNote ? editingNote.category : newNote.category}
                onChange={(e) => {
                  const category = e.target.value as PersonalNote["category"];
                  if (editingNote) {
                    setEditingNote({ ...editingNote, category });
                  } else {
                    setNewNote({ ...newNote, category });
                  }
                }}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-950"
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="reminder">Reminder</option>
                <option value="question">Question</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNote(false);
                  setEditingNote(null);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingNote) {
                    updateNoteMutation.mutate({
                      noteId: editingNote.id,
                      updates: {
                        title: editingNote.title,
                        content: editingNote.content,
                        category: editingNote.category,
                        tags: editingNote.tags
                      }
                    });
                  } else {
                    createNoteMutation.mutate(newNote);
                  }
                }}
              >
                <Save className="h-4 w-4 mr-1" />
                {editingNote ? "Save Changes" : "Create Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}