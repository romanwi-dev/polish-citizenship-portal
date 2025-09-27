import ClientProcessSteps from "@/components/client-process-steps";


export default function ClientProcess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <ClientProcessSteps compact={false} />

    </div>
  );
}