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
      {/* Legend Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stage Visibility Legend</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 dark:text-green-300">👁️ Client Visible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">🔒 Admin Only</span>
            </div>
          </div>
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
              
              return (
                <div key={stage.key} className={cn(
                  "flex-shrink-0 w-32 p-3 rounded-lg border-2 transition-all duration-200",
                  isActive 
                    ? (isClientVisible ? "border-green-500 bg-green-100 dark:bg-green-900/30" : "border-blue-500 bg-blue-100 dark:bg-blue-900/30")
                    : isCompleted 
                    ? (isClientVisible ? "border-green-300 bg-green-50 dark:bg-green-900/10" : "border-gray-300 bg-gray-50 dark:bg-gray-800") 
                    : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-600"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      isActive 
                        ? (isClientVisible ? "bg-green-500 text-white" : "bg-blue-500 text-white")
                        : isCompleted 
                        ? (isClientVisible ? "bg-green-400 text-white" : "bg-gray-400 text-white") 
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {stage.part}
                    </div>
                    <div className="flex items-center gap-1">
                      {isClientVisible ? (
                        <span className="text-green-500" title="Client Visible">👁️</span>
                      ) : (
                        <span className="text-gray-400" title="Admin Only">🔒</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {stage.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {stage.description?.slice(0, 40)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Part Summary Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📋 Parts Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(partNum => {
            const partStages = COMPREHENSIVE_PIPELINE.filter(s => s.part === partNum);
            const hasActiveStage = partStages.some(s => COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === s.key) === activeIdx);
            const isCompleted = partStages.every(s => COMPREHENSIVE_PIPELINE.findIndex(stage => stage.key === s.key) < activeIdx);
            const hasClientStages = partStages.some(s => s.clientVisible);
            
            return (
              <div key={partNum} className={cn(
                "p-3 rounded-lg border text-center",
                hasActiveStage ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : 
                isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/20" : 
                "border-gray-200 bg-gray-50 dark:bg-gray-800"
              )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    hasActiveStage ? "bg-blue-500 text-white" : 
                    isCompleted ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  )}>
                    {partNum}
                  </div>
                  {hasClientStages && (
                    <span className="text-green-500" title="Contains client-visible stages">👁️</span>
                  )}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                  PART {partNum}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {partStages.length} stage{partStages.length > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
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