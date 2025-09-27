import React, { useMemo } from "react";
import type { CaseData } from "@/lib/api";
import { formatPL } from "@/utils/date";
import { cn } from "@/lib/utils";

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
}

const COMPREHENSIVE_PIPELINE: StageInfo[] = [
  // PART 1 - Initial Contact & Assessment
  { key: "PART1_FIRST_CONTACT", label: "First Contact", part: 1, clientVisible: true, description: "Initial client contact and inquiry" },
  { key: "PART1_FAMILY_TREE", label: "Family Tree", part: 1, clientVisible: true, description: "Family tree analysis and documentation" },
  { key: "PART1_ELIGIBILITY", label: "Eligibility Exam", part: 1, clientVisible: false, description: "Case difficulty evaluation on 1-10 scale" },
  
  // PART 2 - Initial Client Communication
  { key: "PART2_INITIAL_ASSESSMENT", label: "Initial Assessment", part: 2, clientVisible: false, description: "Emailing initial assessment and process info" },
  { key: "PART2_CLIENT_CONFIRMATION", label: "Client Confirmation", part: 2, clientVisible: false, description: "Client's confirmation to proceed" },
  
  // PART 3 - Service Selection & Account Setup
  { key: "PART3_TIER_SELECTION", label: "Processing Tier", part: 3, clientVisible: true, description: "STANDARD, EXPEDITED, VIP or VIP+" },
  { key: "PART3_ADVANCE_PAYMENT", label: "Advance Payment", part: 3, clientVisible: true, description: "Initial payment processing" },
  { key: "PART3_ACCOUNT_OPENING", label: "Portal Account", part: 3, clientVisible: true, description: "Opening account on client portal" },
  
  // PART 4 - Basic Details & Power of Attorney
  { key: "PART4_BASIC_DETAILS", label: "Basic Details", part: 4, clientVisible: true, description: "Passport, address, birth certificate, family history" },
  { key: "PART4_POA_PREP", label: "POA Preparation", part: 4, clientVisible: true, description: "Preparing Power of Attorney documents" },
  { key: "PART4_POA_SIGNED", label: "POA Signed", part: 4, clientVisible: true, description: "Client sends signed POAs by Fedex" },
  
  // PART 5 - Master Form & Application Generation
  { key: "PART5_MASTER_FORM", label: "Master Form", part: 5, clientVisible: true, description: "Complete case data form on client account" },
  { key: "PART5_AI_PAPERWORK", label: "AI Paperwork", part: 5, clientVisible: false, description: "AI Agent generates all paperwork" },
  { key: "PART5_APPLICATION_SUBMITTED", label: "Application Submitted", part: 5, clientVisible: false, description: "Citizenship application submitted (10-18 months wait)" },
  
  // PART 6 - Document Collection Strategy
  { key: "PART6_DOCS_COLLECTION", label: "Document Collection", part: 6, clientVisible: false, description: "Gathering local documents with local agent" },
  { key: "PART6_PARTNER_NETWORK", label: "Partner Network", part: 6, clientVisible: false, description: "Connecting to partners for document collection" },
  
  // PART 7 - Archives Research
  { key: "PART7_ARCHIVES_SEARCH", label: "Archives Search", part: 7, clientVisible: false, description: "Polish and international archives research" },
  { key: "PART7_ARCHIVAL_DOCS", label: "Archival Documents", part: 7, clientVisible: false, description: "Receiving and examining archival documents" },
  
  // PART 8 - Translation Services
  { key: "PART8_TRANSLATIONS", label: "Document Translation", part: 8, clientVisible: false, description: "AI translation service processing" },
  { key: "PART8_CERTIFIED_TRANSLATIONS", label: "Certified Translations", part: 8, clientVisible: false, description: "Polish Certified Sworn Translator" },
  
  // PART 9 - Document Submission
  { key: "PART9_DOCUMENT_SUBMISSION", label: "Document Submission", part: 9, clientVisible: false, description: "Submitting all documents before initial response" },
  
  // PART 10 - Polish Civil Acts
  { key: "PART10_CIVIL_ACTS", label: "Civil Acts Application", part: 10, clientVisible: false, description: "Polish civil acts applications and payment" },
  { key: "PART10_CIVIL_ACTS_RECEIVED", label: "Civil Acts Received", part: 10, clientVisible: false, description: "Polish birth and marriage certificates" },
  
  // PART 11 - Initial Government Response
  { key: "PART11_INITIAL_RESPONSE", label: "Initial Response", part: 11, clientVisible: false, description: "Response from Masovian Voivoda's office" },
  { key: "PART11_TERM_EXTENSION", label: "Term Extension", part: 11, clientVisible: false, description: "Extending citizenship procedure term" },
  
  // PART 12 - Pushing Schemes Implementation
  { key: "PART12_PUSHING_SCHEMES", label: "Pushing Schemes", part: 12, clientVisible: false, description: "PUSH, NUDGE, SIT-DOWN schemes" },
  { key: "PART12_SECOND_RESPONSE", label: "Second Response", part: 12, clientVisible: false, description: "Second government response received" },
  
  // PART 13 - Citizenship Decision
  { key: "PART13_CITIZENSHIP_DECISION", label: "Citizenship Decision", part: 13, clientVisible: false, description: "Polish citizenship confirmation decision" },
  
  // PART 14 - Passport Application Process
  { key: "PART14_PASSPORT_PREP", label: "Passport Preparation", part: 14, clientVisible: false, description: "Preparing documents for Polish passport" },
  { key: "PART14_FINAL_PAYMENT", label: "Final Payment", part: 14, clientVisible: false, description: "Charging final payment" },
  { key: "PART14_PASSPORT_OBTAINED", label: "Passport Obtained", part: 14, clientVisible: false, description: "Polish passport successfully obtained" },
  
  // PART 15 - Extended Services
  { key: "PART15_EXTENDED_SERVICES", label: "Extended Services", part: 15, clientVisible: false, description: "Extended family legal services" },
];

interface StagePanelProps {
  case: CaseData;
}

export const StagePanel: React.FC<StagePanelProps> = ({ case: caseData }) => {
  const activeIdx = useMemo(() => {
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
      "DECISION_RECEIVED": "PART13_CITIZENSHIP_DECISION",
      "DECISION": "PART13_CITIZENSHIP_DECISION",
      "PASSPORT": "PART14_PASSPORT_OBTAINED",
    };
    
    const mappedStage = stageMapping[stageKey || ""] || stageKey;
    const i = COMPREHENSIVE_PIPELINE.findIndex(s => s.key === mappedStage);
    return i >= 0 ? i : 0;
  }, [caseData.stage]);

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
      {/* Client-Visible Stages */}
      <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-6">
          🔍 Client-Visible Progress
        </h3>
        <div className="stage-stepper">
          {clientVisibleStages.map((s, i) => {
            const globalIdx = COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === s.key);
            return (
              <div key={s.key} className={cn(
                "step",
                globalIdx <= activeIdx && "is-done",
                globalIdx === activeIdx && "is-active"
              )}>
                <div className="step-dot" />
                <div className="step-label">{s.label}</div>
                {i < clientVisibleStages.length - 1 && <div className="step-rail" />}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-green-700 dark:text-green-300">
          These stages are visible to clients on their portal account
        </div>
      </div>

      {/* Full Process Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📋 Complete 15-Part Process Overview
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(partNum => {
            const partStages = COMPREHENSIVE_PIPELINE.filter(s => s.part === partNum);
            const hasActiveStage = partStages.some(s => COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === s.key) === activeIdx);
            const isCompleted = partStages.every(s => COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === s.key) < activeIdx);
            
            return (
              <div key={partNum} className={cn(
                "p-3 rounded-lg border",
                hasActiveStage ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : 
                isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/20" : 
                "border-gray-200 bg-gray-50 dark:bg-gray-800"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">
                    PART {partNum} - {partStages[0]?.description?.split(' - ')[0] || `Stage ${partNum}`}
                  </h4>
                  <div className="flex items-center gap-2">
                    {partStages.some(s => s.clientVisible) && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">CLIENT</span>
                    )}
                    <span className={cn(
                      "w-3 h-3 rounded-full",
                      hasActiveStage ? "bg-blue-500" : 
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    )} />
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {partStages.map(s => s.label).join(" → ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status summary */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Current Stage</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {COMPREHENSIVE_PIPELINE[activeIdx]?.label || "Not Set"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Part {COMPREHENSIVE_PIPELINE[activeIdx]?.part} • {COMPREHENSIVE_PIPELINE[activeIdx]?.clientVisible ? "Client Visible" : "Internal"}
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