import React, { useMemo, useState, useCallback } from "react";
import type { CaseData } from "@/lib/api";
import { formatPL } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CaseStage = 
  | "PART1_FIRST_CONTACT" | "PART1_FAMILY_TREE" | "PART1_ELIGIBILITY"
  | "PART2_INITIAL_ASSESSMENT" | "PART2_CLIENT_CONFIRMATION"
  | "PART3_TIER_SELECTION" | "PART3_ADVANCE_PAYMENT" | "PART3_ACCOUNT_OPENING"
  | "PART4_BASIC_DETAILS" | "PART4_POA_PREP" | "PART4_POA_SIGNED"
  | "PART5_MASTER_FORM" | "PART5_AI_PAPERWORK" | "PART5_APPLICATION_SUBMITTED"
  | "PART6_DOCS_COLLECTION" | "PART6_PARTNER_NETWORK"
  | "PART7_ARCHIVES_SEARCH" | "PART7_ARCHIVAL_DOCS"
  | "PART8_TRANSLATIONS" | "PART8_CERTIFIED_TRANSLATIONS"
  | "PART9_DOCUMENT_SUBMISSION"
  | "PART10_CIVIL_ACTS" | "PART10_CIVIL_ACTS_RECEIVED"
  | "PART11_INITIAL_RESPONSE" | "PART11_TERM_EXTENSION"
  | "PART12_PUSHING_SCHEMES" | "PART12_SECOND_RESPONSE"
  | "PART13_CITIZENSHIP_DECISION"
  | "PART14_PASSPORT_PREP" | "PART14_FINAL_PAYMENT" | "PART14_PASSPORT_OBTAINED"
  | "PART15_EXTENDED_SERVICES";

interface StageInfo {
  key: CaseStage | string;
  label: string;
  part: number;
  clientVisible: boolean;
  description?: string;
  isMilestone?: boolean; // For stages marked with >>>> in the corrected workflow
}

const COMPREHENSIVE_PIPELINE: StageInfo[] = [
  // PART 1 - FIRST STEPS
  { key: "PART1_FIRST_CONTACT", label: "First Contact", part: 1, clientVisible: true, description: "Initial client contact and inquiry" },
  { key: "PART1_CONTACT_WAVING", label: "Contact Waving", part: 1, clientVisible: false, description: "Follow-up contact wave" },
  { key: "PART1_ANSWERING_INQUIRY", label: "Answering Inquiry", part: 1, clientVisible: false, description: "Responding to client inquiry" },
  { key: "PART1_CITIZENSHIP_TEST", label: "Citizenship Test", part: 1, clientVisible: true, description: "Citizenship eligibility assessment test" },
  { key: "PART1_FAMILY_TREE", label: "Family Tree", part: 1, clientVisible: true, description: "Family tree analysis and documentation", isMilestone: true },
  { key: "PART1_ELIGIBILITY_EXAM", label: "Eligibility Examination", part: 1, clientVisible: false, description: "Eligibility examination (yes, maybe, no)" },
  { key: "PART1_DIFFICULTY_EVAL", label: "Case Difficulty Evaluation", part: 1, clientVisible: false, description: "Case difficulty evaluation on 1-10 scale" },
  { key: "PART1_ELIGIBILITY_CALL", label: "Eligibility Call", part: 1, clientVisible: true, description: "Initial eligibility consultation call", isMilestone: true },

  // PART 2 - TERMS & PRICING
  { key: "PART2_INITIAL_ASSESSMENT", label: "Initial Assessment Email", part: 2, clientVisible: true, description: "Emailing initial assessment to client" },
  { key: "PART2_FULL_PROCESS_INFO", label: "Full Process Info", part: 2, clientVisible: true, description: "Emailing full process info with pricing" },
  { key: "PART2_CLIENT_CONFIRMATION", label: "Client Confirmation", part: 2, clientVisible: true, description: "Client's confirmation to proceed" },
  { key: "PART2_DOCUMENT_LIST", label: "Document List", part: 2, clientVisible: true, description: "Emailing list of all needed documents" },

  // PART 3 - ADVANCE & ACCOUNT
  { key: "PART3_ADVANCE_PAYMENT", label: "Advance Payment", part: 3, clientVisible: true, description: "Initial advance payment processing", isMilestone: true },
  { key: "PART3_ACCOUNT_OPENING", label: "Portal Account Opening", part: 3, clientVisible: true, description: "Opening account on client portal", isMilestone: true },

  // PART 4 - DETAILS & POAs
  { key: "PART4_BASIC_DETAILS", label: "Basic Details Collection", part: 4, clientVisible: true, description: "Client provides passport copy, address, birth certificate, phone number, family history" },
  { key: "PART4_POA_PREP", label: "POA Preparation", part: 4, clientVisible: true, description: "Preparing the Power of Attorney documents" },
  { key: "PART4_POA_EMAIL", label: "POA Email", part: 4, clientVisible: true, description: "Emailing the POAs to client" },
  { key: "PART4_POA_FEDEX", label: "POA FedEx Delivery", part: 4, clientVisible: true, description: "Client sends signed POAs by FedEx to Warsaw office" },

  // PART 5 - DATA & APPLICATION
  { key: "PART5_MASTER_FORM", label: "Master Form Completion", part: 5, clientVisible: true, description: "Client fills the MASTER FORM with all case data", isMilestone: true },
  { key: "PART5_AI_PAPERWORK", label: "AI Paperwork Generation", part: 5, clientVisible: false, description: "AI Agent generates all the paperwork", isMilestone: true },
  { key: "PART5_DRAFT_APPLICATION", label: "Draft Citizenship Application", part: 5, clientVisible: true, description: "Draft citizenship application prepared" },
  { key: "PART5_APPLICATION_SUBMITTED", label: "Application Submitted", part: 5, clientVisible: true, description: "Submitting citizenship application" },
  { key: "PART5_AWAITING_RESPONSE", label: "Awaiting Initial Response", part: 5, clientVisible: true, description: "Awaiting initial response (10-18 months)", isMilestone: true },
  { key: "PART5_EMAIL_COPY", label: "Email Submission Copy", part: 5, clientVisible: true, description: "Emailing copy of official Polish citizenship application submission" },
  { key: "PART5_ADD_TO_ACCOUNT", label: "Add Copy to Account", part: 5, clientVisible: true, description: "Adding submission copy to client account" },

  // PART 6 - LOCAL DOCUMENTS
  { key: "PART6_DOCS_CLARIFICATION", label: "Documents List Clarification", part: 6, clientVisible: true, description: "Clarifying document requirements with client" },
  { key: "PART6_GATHERING_DOCS", label: "Gathering Local Documents", part: 6, clientVisible: true, description: "Collecting local documents from client" },
  { key: "PART6_LOCAL_AGENT", label: "Local Agent Advising", part: 6, clientVisible: true, description: "Advising by local agent" },
  { key: "PART6_PARTNER_CONNECTION", label: "Partner Connection", part: 6, clientVisible: true, description: "Connecting to our partners to help collecting documents", isMilestone: true },
  { key: "PART6_RECEIVING_DOCS", label: "Receiving Documents", part: 6, clientVisible: true, description: "Receiving documents from client/partners" },
  { key: "PART6_EXAMINING_DOCS", label: "Examining Documents", part: 6, clientVisible: true, description: "Examining and choosing documents to translate and file" },

  // PART 7 - POLISH DOCUMENTS
  { key: "PART7_POLISH_ARCHIVES", label: "Polish Archives Search", part: 7, clientVisible: true, description: "Polish archives search" },
  { key: "PART7_INTERNATIONAL_ARCHIVES", label: "International Archives Search", part: 7, clientVisible: true, description: "International archives search" },
  { key: "PART7_FAMILY_POSSESSIONS", label: "Family Possessions Search", part: 7, clientVisible: true, description: "Family possessions search for old Polish documents" },
  { key: "PART7_PARTNER_PROCESSORS", label: "Partner Processors", part: 7, clientVisible: true, description: "Connecting to our partners to process each search", isMilestone: true },
  { key: "PART7_RECEIVING_ARCHIVAL", label: "Receiving Archival Documents", part: 7, clientVisible: true, description: "Receiving archival documents" },
  { key: "PART7_EXAMINING_ARCHIVAL", label: "Examining Archival Documents", part: 7, clientVisible: false, description: "Examining archival documents for translation and filing" },

  // PART 8 - TRANSLATIONS
  { key: "PART8_AI_TRANSLATIONS", label: "AI Translation Service", part: 8, clientVisible: true, description: "Translations using AI translation service on portal" },
  { key: "PART8_CERTIFIED_TRANSLATIONS", label: "Certified Translations", part: 8, clientVisible: true, description: "Certifying translations with Polish Certified Sworn Translator" },
  { key: "PART8_TRANSLATIONS_AGENT", label: "Translations Agent Supervision", part: 8, clientVisible: true, description: "Dedicated translations agent supervision", isMilestone: true },
  { key: "PART8_DOUBLE_CHECK", label: "Independent Double-Check", part: 8, clientVisible: true, description: "Double-checking translations by independent agent" },

  // PART 9 - FILING DOCUMENTS
  { key: "PART9_SUBMIT_LOCAL_DOCS", label: "Submit Local Documents", part: 9, clientVisible: true, description: "Submitting birth, marriage certificates, naturalization acts, military records" },
  { key: "PART9_SUBMIT_FAMILY_INFO", label: "Submit Family Information", part: 9, clientVisible: true, description: "Submitting detailed family information" },
  { key: "PART9_BEFORE_INITIAL_RESPONSE", label: "Complete Before Initial Response", part: 9, clientVisible: false, description: "Completing all filing before initial response if possible" },

  // PART 10 - CIVIL ACTS
  { key: "PART10_CIVIL_ACTS_PREP", label: "Civil Acts Applications", part: 10, clientVisible: true, description: "Preparing Polish civil acts applications" },
  { key: "PART10_CIVIL_ACTS_PAYMENT", label: "Civil Acts Payment", part: 10, clientVisible: true, description: "Charging payment for Polish civil acts", isMilestone: true },
  { key: "PART10_CIVIL_ACTS_AGENT", label: "Civil Acts Agent", part: 10, clientVisible: true, description: "Supervised by dedicated civil acts agent", isMilestone: true },
  { key: "PART10_SUBMIT_TO_REGISTRY", label: "Submit to Civil Registry", part: 10, clientVisible: true, description: "Submitting to relevant Polish Civil Registry office" },
  { key: "PART10_RECEIVE_CERTIFICATES", label: "Receive Polish Certificates", part: 10, clientVisible: true, description: "Receiving Polish birth and marriage certificates" },

  // PART 11 - INITIAL RESPONSE
  { key: "PART11_INITIAL_RESPONSE", label: "Initial Response Received", part: 11, clientVisible: true, description: "Receiving initial response from Masovian Voivoda's office" },
  { key: "PART11_EVALUATE_DEMANDS", label: "Evaluate Government Demands", part: 11, clientVisible: false, description: "Evaluation of demands put by the government" },
  { key: "PART11_SEND_COPY_EXPLANATIONS", label: "Send Copy with Explanations", part: 11, clientVisible: true, description: "Sending copy of letter with explanations to client" },
  { key: "PART11_EXTEND_TERM", label: "Extend Procedure Term", part: 11, clientVisible: true, description: "Extending term of citizenship procedure", isMilestone: true },
  { key: "PART11_AWAIT_EVIDENCE", label: "Await Additional Evidence", part: 11, clientVisible: true, description: "Awaiting additional evidence from client" },

  // PART 12 - PUSH SCHEMES
  { key: "PART12_OFFER_SCHEMES", label: "Offer Push Schemes", part: 12, clientVisible: true, description: "Offering PUSH, NUDGE, SIT-DOWN schemes" },
  { key: "PART12_EXPLAIN_SCHEMES", label: "Explain Schemes", part: 12, clientVisible: true, description: "Explaining schemes in detail" },
  { key: "PART12_SCHEME_PAYMENTS", label: "Scheme Payments", part: 12, clientVisible: true, description: "Payments for the schemes" },
  { key: "PART12_IMPLEMENT_SCHEMES", label: "Implement Schemes", part: 12, clientVisible: true, description: "Introducing the schemes in practice", isMilestone: true },
  { key: "PART12_SECOND_RESPONSE", label: "Second Government Response", part: 12, clientVisible: true, description: "Receiving 2nd response from government" },
  { key: "PART12_RE_IMPLEMENT_SCHEMES", label: "Re-implement Schemes", part: 12, clientVisible: true, description: "Introducing schemes again", isMilestone: true },

  // PART 13 - CITIZENSHIP DECISION
  { key: "PART13_CITIZENSHIP_CONFIRMATION", label: "Citizenship Confirmation", part: 13, clientVisible: true, description: "Polish citizenship confirmation decision received" },
  { key: "PART13_EMAIL_DECISION", label: "Email Decision Copy", part: 13, clientVisible: true, description: "Emailing decision copy and adding to portal account" },
  { key: "PART13_APPEAL_IF_NEGATIVE", label: "Appeal if Negative", part: 13, clientVisible: false, description: "Preparing appeal to Ministry of Interior (2 weeks max)" },

  // PART 14 - POLISH PASSPORT
  { key: "PART14_PASSPORT_DOCS_PREP", label: "Passport Documents Prep", part: 14, clientVisible: true, description: "Preparing all documents for Polish passport application" },
  { key: "PART14_FINAL_PAYMENT", label: "Final Payment", part: 14, clientVisible: true, description: "Charging the final payment", isMilestone: true },
  { key: "PART14_FEDEX_DOCUMENTS", label: "FedEx Documents", part: 14, clientVisible: true, description: "Sending all documents by FedEx" },
  { key: "PART14_SCHEDULE_CONSULATE", label: "Schedule Consulate Visit", part: 14, clientVisible: true, description: "Scheduling visit at Polish Consulate" },
  { key: "PART14_CLIENT_PASSPORT_APPLICATION", label: "Client Passport Application", part: 14, clientVisible: false, description: "Client applies for the passport" },
  { key: "PART14_PASSPORT_OBTAINED", label: "Polish Passport Obtained", part: 14, clientVisible: true, description: "Polish passport successfully obtained", isMilestone: true },

  // PART 15 - EXTENDED SERVICES
  { key: "PART15_EXTENDED_SERVICES", label: "Extended Family Legal Services", part: 15, clientVisible: false, description: "Extended family legal services", isMilestone: true },
];

interface StagePanelProps {
  case: CaseData;
}

export const StagePanel: React.FC<StagePanelProps> = ({ case: caseData }) => {
  const { toast } = useToast();
  
  // Stage management state
  const [localActiveIdx, setLocalActiveIdx] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [draggedStage, setDraggedStage] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const baseActiveIdx = useMemo(() => {
    // Map case stage to comprehensive pipeline stages
    let stageKey = caseData.stage?.toUpperCase();
    
    // Map existing stage variations to new comprehensive pipeline
    const stageMapping: Record<string, string> = {
      "FIRST_CONTACT": "PART1_FIRST_CONTACT",
      "INTAKE": "PART5_MASTER_FORM",
      "DOCS_COLLECT": "PART6_DOCS_COLLECTION", 
      "USC_IN_FLIGHT": "PART5_APPLICATION_SUBMITTED",
      "USC_READY": "PART5_APPLICATION_SUBMITTED",
      "OBY_DRAFTING": "PART5_AI_PAPERWORK",
      "OBY_READY": "PART5_APPLICATION_SUBMITTED",
      "OBY_SUBMITTABLE": "PART5_APPLICATION_SUBMITTED", 
      "OBY_SUBMITTED": "PART5_APPLICATION_SUBMITTED",
      "DECISION_RECEIVED": "PART13_CITIZENSHIP_CONFIRMATION",
      "DECISION": "PART13_CITIZENSHIP_CONFIRMATION",
      "PASSPORT": "PART14_PASSPORT_OBTAINED",
    };
    
    const mappedStage = stageMapping[stageKey || ""] || stageKey;
    const i = COMPREHENSIVE_PIPELINE.findIndex(s => s.key === mappedStage);
    return i >= 0 ? i : 0;
  }, [caseData.stage]);

  // Use local state if available, otherwise use base active index
  const activeIdx = localActiveIdx !== null ? localActiveIdx : baseActiveIdx;

  // Stage management handlers
  const handleStageComplete = useCallback(() => {
    const nextIdx = Math.min(activeIdx + 1, COMPREHENSIVE_PIPELINE.length - 1);
    setLocalActiveIdx(nextIdx);
    toast({
      title: "Stage Completed",
      description: `Moved to ${COMPREHENSIVE_PIPELINE[nextIdx]?.label || 'next stage'}`,
    });
  }, [activeIdx, toast]);

  const handleStageSkip = useCallback(() => {
    const nextIdx = Math.min(activeIdx + 1, COMPREHENSIVE_PIPELINE.length - 1);
    setLocalActiveIdx(nextIdx);
    toast({
      title: "Stage Skipped",
      description: `Skipped to ${COMPREHENSIVE_PIPELINE[nextIdx]?.label || 'next stage'}`,
    });
  }, [activeIdx, toast]);

  const handleMarkActive = useCallback((stageKey: string) => {
    const stageIdx = COMPREHENSIVE_PIPELINE.findIndex(s => s.key === stageKey);
    if (stageIdx >= 0) {
      setLocalActiveIdx(stageIdx);
      toast({
        title: "Stage Activated",
        description: `Set ${COMPREHENSIVE_PIPELINE[stageIdx].label} as active`,
      });
    }
  }, [toast]);

  const handleStageReview = useCallback((stageKey: string) => {
    const stage = COMPREHENSIVE_PIPELINE.find(s => s.key === stageKey);
    if (stage) {
      setIsEditing(stageKey);
      toast({
        title: "Reviewing Stage",
        description: `Reviewing ${stage.label}`,
      });
    }
  }, [toast]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, stageKey: string) => {
    setDraggedStage(stageKey);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDragOverStage(stageKey);
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStageKey: string) => {
    e.preventDefault();
    const draggedStageKey = draggedStage;
    setDraggedStage(null);
    setDragOverStage(null);
    
    if (draggedStageKey && draggedStageKey !== targetStageKey) {
      toast({
        title: "Stage Reordered",
        description: `Moved stage to new position`,
      });
    }
  }, [draggedStage, toast]);

  // Get client-visible stages for separate display
  const clientVisibleStages = COMPREHENSIVE_PIPELINE.filter(stage => stage.clientVisible);
  const internalStages = COMPREHENSIVE_PIPELINE.filter(stage => !stage.clientVisible);

  // Calculate case age in days
  const ageDays = useMemo(() => {
    if (!caseData.createdAt) return 0;
    const created = new Date(caseData.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }, [caseData.createdAt]);

  return (
    <div className="stage-panel space-y-6">
      {/* Enhanced Legend & Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Interactive Stage Management System</h3>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 dark:text-green-300">👁️ Client Visible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">🔒 Admin Only</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-600 dark:text-yellow-400">🏆 Major Milestone</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 dark:text-blue-400">⚡ Interactive</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="text-xs px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
              data-testid="button-stage-analytics"
            >
              📊 Analytics
            </button>
            <button 
              className="text-xs px-3 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              data-testid="button-export-timeline"
            >
              📤 Export Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview Dashboard */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 Progress Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-stages">
              {COMPREHENSIVE_PIPELINE.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Stages</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-completed-stages">
              {activeIdx}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-client-visible-stages">
              {COMPREHENSIVE_PIPELINE.filter(s => s.clientVisible).length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Client Visible</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-milestone-stages">
              {COMPREHENSIVE_PIPELINE.filter(s => s.isMilestone).length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Milestones</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((activeIdx / COMPREHENSIVE_PIPELINE.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(activeIdx / COMPREHENSIVE_PIPELINE.length) * 100}%` }}
              data-testid="progress-bar-overall"
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-15 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(partNum => {
            const partStages = COMPREHENSIVE_PIPELINE.filter(s => s.part === partNum);
            const completedInPart = partStages.filter((_, i) => COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === partStages[i].key) < activeIdx).length;
            const progressPercent = partStages.length > 0 ? (completedInPart / partStages.length) * 100 : 0;
            const hasActive = partStages.some(s => COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === s.key) === activeIdx);
            
            return (
              <div key={partNum} className="text-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-1 transition-all duration-200",
                    hasActive 
                      ? "bg-blue-500 text-white ring-2 ring-blue-300" 
                      : progressPercent === 100 
                      ? "bg-green-500 text-white" 
                      : progressPercent > 0 
                      ? "bg-yellow-400 text-gray-800" 
                      : "bg-gray-200 text-gray-600"
                  )}
                  data-testid={`part-indicator-${partNum}`}
                  title={`Part ${partNum}: ${completedInPart}/${partStages.length} completed`}
                >
                  {partNum}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-green-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Stages Horizontal Scrollable Rail */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete Stage Pipeline (15 Parts)
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Scroll horizontally to see all stages →
          </div>
        </div>
        
        <div className="relative">
          <div className="flex overflow-x-auto gap-3 pb-4 stage-horizontal-rail">
            {COMPREHENSIVE_PIPELINE.map((stage, i) => {
              const isActive = i === activeIdx;
              const isCompleted = i < activeIdx;
              const isClientVisible = stage.clientVisible;
              const isMilestone = stage.isMilestone;
              
              return (
                <div 
                  key={stage.key} 
                  className={cn(
                    "flex-shrink-0 w-36 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                    isMilestone && "ring-2 ring-yellow-300 dark:ring-yellow-600",
                    draggedStage === stage.key && "opacity-50 scale-95",
                    dragOverStage === stage.key && "ring-2 ring-blue-400 scale-105",
                    isActive 
                      ? (isClientVisible ? "border-green-500 bg-green-100 dark:bg-green-900/30 shadow-lg" : "border-blue-500 bg-blue-100 dark:bg-blue-900/30 shadow-lg")
                      : isCompleted 
                      ? (isClientVisible ? "border-green-300 bg-green-50 dark:bg-green-900/10" : "border-gray-300 bg-gray-50 dark:bg-gray-800") 
                      : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-600 hover:border-gray-300"
                  )}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, stage.key)}
                  onDragOver={(e) => handleDragOver(e, stage.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  onClick={() => handleMarkActive(stage.key)}
                  data-testid={`stage-card-${stage.key}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold relative",
                      isActive 
                        ? (isClientVisible ? "bg-green-500 text-white" : "bg-blue-500 text-white")
                        : isCompleted 
                        ? (isClientVisible ? "bg-green-400 text-white" : "bg-gray-400 text-white") 
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {stage.part}
                      {isMilestone && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">⭐</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isClientVisible ? (
                        <span className="text-green-500 text-sm" title="Client Visible">👁️</span>
                      ) : (
                        <span className="text-gray-400 text-sm" title="Admin Only">🔒</span>
                      )}
                      {isMilestone && (
                        <span className="text-yellow-500 text-xs" title="Major Milestone">🏆</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {stage.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                    {stage.description?.slice(0, 35)}...
                  </div>
                  
                  {/* Interactive Status Indicator */}
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      isActive 
                        ? "bg-blue-500 text-white" 
                        : isCompleted 
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    )}>
                      {isActive ? "ACTIVE" : isCompleted ? "DONE" : "PENDING"}
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 text-xs p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add edit menu
                        console.log('Edit menu for:', stage.key);
                      }}
                    >
                      ⚙️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Kanban-Style Stage Management */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🏗️ Interactive Stage Management
          </h3>
          <div className="flex items-center gap-2">
            <button 
              className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              data-testid="button-add-stage"
            >
              + Add Stage
            </button>
            <button 
              className="text-xs px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              data-testid="button-bulk-edit"
            >
              Bulk Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Stages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Pending Stages</h4>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {COMPREHENSIVE_PIPELINE.filter((_, i) => i > activeIdx).length}
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {COMPREHENSIVE_PIPELINE.filter((_, i) => i > activeIdx).slice(0, 8).map((stage, index) => (
                <div 
                  key={stage.key} 
                  className={cn(
                    "p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 transition-colors cursor-pointer",
                    draggedStage === stage.key && "opacity-50 scale-95",
                    dragOverStage === stage.key && "ring-2 ring-blue-400 scale-105"
                  )}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, stage.key)}
                  onDragOver={(e) => handleDragOver(e, stage.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  data-testid={`pending-stage-${stage.key}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{stage.label}</span>
                    <div className="flex items-center gap-1">
                      {stage.clientVisible && <span className="text-green-500 text-xs">👁️</span>}
                      {stage.isMilestone && <span className="text-yellow-500 text-xs">🏆</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{stage.description?.slice(0, 50)}...</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Part {stage.part}</span>
                    <button 
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      data-testid={`button-mark-active-${stage.key}`}
                      onClick={() => handleMarkActive(stage.key)}
                    >
                      Mark Active
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Stage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Active Stage</h4>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">1</span>
            </div>
            {COMPREHENSIVE_PIPELINE[activeIdx] && (
              <div className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">{COMPREHENSIVE_PIPELINE[activeIdx].label}</span>
                  <div className="flex items-center gap-2">
                    {COMPREHENSIVE_PIPELINE[activeIdx].clientVisible && <span className="text-green-500">👁️</span>}
                    {COMPREHENSIVE_PIPELINE[activeIdx].isMilestone && <span className="text-yellow-500">🏆</span>}
                    <button className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                  </div>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 mb-3">{COMPREHENSIVE_PIPELINE[activeIdx].description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">Part {COMPREHENSIVE_PIPELINE[activeIdx].part}</span>
                  <div className="flex gap-2">
                    <button 
                      className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      data-testid="button-complete-stage"
                      onClick={handleStageComplete}
                    >
                      Complete
                    </button>
                    <button 
                      className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      data-testid="button-skip-stage"
                      onClick={handleStageSkip}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Completed Stages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-green-700 dark:text-green-300">Completed Stages</h4>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {COMPREHENSIVE_PIPELINE.filter((_, i) => i < activeIdx).length}
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {COMPREHENSIVE_PIPELINE.filter((_, i) => i < activeIdx).slice(-8).reverse().map((stage) => (
                <div 
                  key={stage.key} 
                  className={cn(
                    "p-3 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10 rounded-lg transition-colors cursor-pointer",
                    draggedStage === stage.key && "opacity-50 scale-95",
                    dragOverStage === stage.key && "ring-2 ring-blue-400 scale-105"
                  )}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, stage.key)}
                  onDragOver={(e) => handleDragOver(e, stage.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  data-testid={`completed-stage-${stage.key}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-900 dark:text-green-100">{stage.label}</span>
                    <div className="flex items-center gap-1">
                      {stage.clientVisible && <span className="text-green-500 text-xs">👁️</span>}
                      {stage.isMilestone && <span className="text-yellow-500 text-xs">🏆</span>}
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mb-2">{stage.description?.slice(0, 50)}...</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 dark:text-green-400">Part {stage.part}</span>
                    <button 
                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      data-testid={`button-review-${stage.key}`}
                      onClick={() => handleStageReview(stage.key)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Current Status */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Stage</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {COMPREHENSIVE_PIPELINE[activeIdx]?.label || "Not Set"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Part {COMPREHENSIVE_PIPELINE[activeIdx]?.part}
              </span>
              <div className="flex items-center gap-1">
                {COMPREHENSIVE_PIPELINE[activeIdx]?.clientVisible ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span className="text-green-500">👁️</span>
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">Client Visible</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <span className="text-gray-400">🔒</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Admin Only</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Case Age</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{ageDays} days</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{formatPL(caseData.updatedAt)}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
        <ul className="timeline-list">
          {caseData.timeline && caseData.timeline.length > 0 ? (
            caseData.timeline.map((t: any, idx: number) => (
              <li key={idx} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-title">{t.title}</div>
                  <div className="timeline-meta">{formatPL(t.date)} • {t.actor ?? "System"}</div>
                  {t.note && <div className="timeline-note">{t.note}</div>}
                  {t.description && <div className="timeline-note">{t.description}</div>}
                </div>
              </li>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">No events yet.</div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StagePanel;