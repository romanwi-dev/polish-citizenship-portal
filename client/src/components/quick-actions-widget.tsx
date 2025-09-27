import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  MessageSquare, 
  Calendar, 
  Download,
  FileText,
  Phone,
  CreditCard,
  ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
  variant?: "default" | "outline" | "secondary";
}

export default function QuickActionsWidget({ 
  onUploadDocument,
  onScheduleConsultation,
  onContactLawyer,
  onMakePayment 
}: {
  onUploadDocument?: () => void;
  onScheduleConsultation?: () => void;
  onContactLawyer?: () => void;
  onMakePayment?: () => void;
}) {
  const { toast } = useToast();

  const quickActions: QuickAction[] = [
    {
      icon: <Upload className="h-4 w-4" />,
      label: "Upload Document",
      description: "Add new documents to your case",
      action: () => {
        if (onUploadDocument) {
          onUploadDocument();
        } else {
          toast({
            title: "Upload Document",
            description: "Opening document upload interface..."
          });
        }
      },
      variant: "default"
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      label: "Send Message",
      description: "Contact your case manager",
      action: () => {
        if (onContactLawyer) {
          onContactLawyer();
        } else {
          toast({
            title: "Messaging",
            description: "Opening secure messaging..."
          });
        }
      },
      variant: "outline"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Schedule Call",
      description: "Book a consultation",
      action: () => {
        if (onScheduleConsultation) {
          onScheduleConsultation();
        } else {
          toast({
            title: "Schedule Consultation",
            description: "Opening calendar..."
          });
        }
      },
      variant: "outline"
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "Make Payment",
      description: "Pay for services",
      action: () => {
        if (onMakePayment) {
          onMakePayment();
        } else {
          toast({
            title: "Payment",
            description: "Opening payment portal..."
          });
        }
      },
      variant: "outline"
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: "Download Forms",
      description: "Get application forms",
      action: () => {
        toast({
          title: "Download Forms",
          description: "Preparing forms for download..."
        });
      },
      variant: "outline"
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "View Checklist",
      description: "Track requirements",
      action: () => {
        toast({
          title: "Document Checklist",
          description: "Loading your checklist..."
        });
      },
      variant: "outline"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "List required documents",
      description: "Show document requirements",
      action: () => {
        // Integrate the enhanced script functionality
        const documents = `📋 Required Documents for Polish Citizenship by Descent:

🏛️ For Your Polish Ancestor:
• 📜 Birth certificate (certified copy)
• ⚰️ Death certificate (if applicable)
• 💒 Marriage certificate (if applicable)
• 🛳️ Immigration/emigration records
• 🇵🇱 Polish passport (if available)

👤 For You:
• 📜 Your birth certificate
• 💒 Marriage certificate (if applicable)
• 🛂 Current passport/ID
• 🔗 Proof of relationship to Polish ancestor

📎 Additional Documents:
• 🪖 Military records (if applicable)
• 🏛️ Naturalization papers (if ancestor became citizen elsewhere)
• ⛪ Church records (baptism, marriage, etc.)

💡 Would you like me to help you understand which specific documents apply to your case?`;
        
        toast({
          title: "📋 Required Documents",
          description: documents,
          duration: 10000,
        });
      },
      variant: "default"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className={`h-auto flex flex-col items-center justify-center p-4 space-y-2 ${
                action.label === "Upload Document" ? "upload-document-btn" : ""
              }`}
            >
              <div className="text-primary">{action.icon}</div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}