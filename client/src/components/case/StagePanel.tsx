import React, { useMemo, useState, useCallback } from "react";
import type { CaseData } from "@/lib/api";
import type { StageActionLink } from "@shared/schema";
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
  importance?: 'critical' | 'high' | 'medium' | 'low'; // For background color indication
  links?: StageActionLink[]; // Related system components and actions
}

const COMPREHENSIVE_PIPELINE: StageInfo[] = [
  // PART 1 - FIRST STEPS
  { 
    key: "PART1_FIRST_CONTACT", 
    label: "First Contact", 
    part: 1, 
    clientVisible: true, 
    description: "Initial client contact and inquiry",
    importance: "critical"
  },
  { key: "PART1_CONTACT_WAVING", label: "Contact Waving", part: 1, clientVisible: false, description: "Follow-up contact wave", importance: "low" },
  { key: "PART1_ANSWERING_INQUIRY", label: "Answering Inquiry", part: 1, clientVisible: false, description: "Responding to client inquiry", importance: "medium" },
  { 
    key: "PART1_CITIZENSHIP_TEST", 
    label: "Citizenship Test", 
    part: 1, 
    clientVisible: true, 
    description: "Citizenship eligibility assessment test",
    importance: "high"
  },
  { 
    key: "PART1_FAMILY_TREE", 
    label: "Family Tree", 
    part: 1, 
    clientVisible: true, 
    description: "Family tree analysis and documentation", 
    isMilestone: true,
    importance: "critical",
    links: [
      {
        id: 'family-tree-edit',
        label: 'Edit Family Tree',
        targetType: 'familyTree',
        route: '/family-tree',
        status: 'available',
        description: 'Add or modify family members and genealogical relationships'
      },
      {
        id: 'family-tree-pdf',
        label: 'Export Family Tree PDF',
        targetType: 'document',
        payload: { type: 'family-tree-pdf' },
        status: 'available',
        description: 'Generate PDF export of complete family tree'
      }
    ]
  },
  { key: "PART1_ELIGIBILITY_EXAM", label: "Eligibility Examination", part: 1, clientVisible: false, description: "Eligibility examination (yes, maybe, no)", importance: "high" },
  { key: "PART1_DIFFICULTY_EVAL", label: "Case Difficulty Evaluation", part: 1, clientVisible: false, description: "Case difficulty evaluation on 1-10 scale", importance: "medium" },
  { key: "PART1_ELIGIBILITY_CALL", label: "Eligibility Call", part: 1, clientVisible: true, description: "Initial eligibility consultation call", isMilestone: true, importance: "critical" },

  // PART 2 - TERMS & PRICING
  { key: "PART2_INITIAL_ASSESSMENT", label: "Initial Assessment Email", part: 2, clientVisible: true, description: "Emailing initial assessment to client", importance: "high" },
  { key: "PART2_FULL_PROCESS_INFO", label: "Full Process Info", part: 2, clientVisible: true, description: "Emailing full process info with pricing", importance: "high" },
  { key: "PART2_CLIENT_CONFIRMATION", label: "Client Confirmation", part: 2, clientVisible: true, description: "Client's confirmation to proceed", importance: "critical" },
  { key: "PART2_DOCUMENT_LIST", label: "Document List", part: 2, clientVisible: true, description: "Emailing list of all needed documents", importance: "medium" },

  // PART 3 - ADVANCE & ACCOUNT
  { 
    key: "PART3_ADVANCE_PAYMENT", 
    label: "Advance Payment", 
    part: 3, 
    clientVisible: true, 
    description: "Initial advance payment processing", 
    isMilestone: true, 
    importance: "critical",
    links: [
      {
        id: 'payment-processing',
        label: 'Process Payment',
        targetType: 'payments',
        route: '/payments',
        status: 'available',
        description: 'Process advance payment for citizenship application'
      },
      {
        id: 'payment-invoice',
        label: 'Payment Invoice',
        targetType: 'document',
        payload: { type: 'invoice', stage: 'advance' },
        status: 'pending',
        description: 'Generate and send payment invoice'
      },
      {
        id: 'payment-tasks',
        label: 'Payment Tasks',
        targetType: 'tasks',
        payload: { filter: 'payment' },
        status: 'pending',
        count: 2,
        description: 'Track payment processing and confirmation'
      }
    ]
  },
  { key: "PART3_ACCOUNT_OPENING", label: "Portal Account Opening", part: 3, clientVisible: true, description: "Opening account on client portal", isMilestone: true, importance: "high" },

  // PART 4 - DETAILS & POAs
  { 
    key: "PART4_BASIC_DETAILS", 
    label: "Basic Details Collection", 
    part: 4, 
    clientVisible: true, 
    description: "Client provides passport copy, address, birth certificate, phone number, family history",
    importance: "critical"
  },
  { 
    key: "PART4_POA_PREP", 
    label: "POA Preparation", 
    part: 4, 
    clientVisible: true, 
    description: "Preparing the Power of Attorney documents",
    importance: "critical",
    links: [
      {
        id: 'poa-form',
        label: 'POA Application Form',
        targetType: 'poa',
        route: '/poa-adult',
        status: 'available',
        description: 'Complete Power of Attorney application form'
      },
      {
        id: 'poa-documents',
        label: 'POA Documents',
        targetType: 'document',
        payload: { type: 'poa-templates' },
        status: 'available',
        description: 'View and download POA document templates'
      },
      {
        id: 'poa-tasks',
        label: 'POA Tasks',
        targetType: 'tasks',
        payload: { filter: 'poa' },
        status: 'pending',
        count: 3,
        description: 'Track POA preparation and submission tasks'
      }
    ]
  },
  { 
    key: "PART4_POA_EMAIL", 
    label: "POA Email", 
    part: 4, 
    clientVisible: true, 
    description: "Emailing the POAs to client",
    importance: "high"
  },
  { key: "PART4_POA_FEDEX", label: "POA FedEx Delivery", part: 4, clientVisible: true, description: "Client sends signed POAs by FedEx to Warsaw office", importance: "critical" },

  // PART 5 - DATA & APPLICATION
  { 
    key: "PART5_MASTER_FORM", 
    label: "Master Form Completion", 
    part: 5, 
    clientVisible: true, 
    description: "Client fills the MASTER FORM with all case data", 
    isMilestone: true, 
    importance: "critical",
    links: [
      {
        id: 'client-dashboard',
        label: 'Client Dashboard',
        targetType: 'familyTree',
        route: '/client-dashboard',
        status: 'available',
        description: 'Access main client dashboard for form completion'
      },
      {
        id: 'family-tree-data',
        label: 'Family Tree Data',
        targetType: 'familyTree',
        route: '/family-tree',
        status: 'pending',
        description: 'Review and complete family tree information'
      }
    ]
  },
  { key: "PART5_AI_PAPERWORK", label: "AI Paperwork Generation", part: 5, clientVisible: false, description: "AI Agent generates all the paperwork", isMilestone: true, importance: "critical" },
  { key: "PART5_DRAFT_APPLICATION", label: "Draft Citizenship Application", part: 5, clientVisible: true, description: "Draft citizenship application prepared", importance: "high" },
  { 
    key: "PART5_APPLICATION_SUBMITTED", 
    label: "Application Submitted", 
    part: 5, 
    clientVisible: true, 
    description: "Submitting citizenship application", 
    importance: "critical",
    links: [
      {
        id: 'citizenship-application',
        label: 'Citizenship Application PDF',
        targetType: 'application',
        payload: { type: 'citizenship-form' },
        status: 'completed',
        description: 'View submitted citizenship application document'
      },
      {
        id: 'submission-email',
        label: 'Send Confirmation Email',
        targetType: 'email',
        payload: { template: 'application-submitted' },
        status: 'pending',
        description: 'Send application submission confirmation to client'
      },
      {
        id: 'submission-letter',
        label: 'Official Submission Letter',
        targetType: 'letter',
        payload: { type: 'government-submission' },
        status: 'available',
        description: 'Generate official submission letter to authorities'
      }
    ]
  },
  { key: "PART5_AWAITING_RESPONSE", label: "Awaiting Initial Response", part: 5, clientVisible: true, description: "Awaiting initial response (10-18 months)", isMilestone: true, importance: "critical" },
  { key: "PART5_EMAIL_COPY", label: "Email Submission Copy", part: 5, clientVisible: true, description: "Emailing copy of official Polish citizenship application submission", importance: "medium" },
  { key: "PART5_ADD_TO_ACCOUNT", label: "Add Copy to Account", part: 5, clientVisible: true, description: "Adding submission copy to client account", importance: "low" },

  // PART 6 - LOCAL DOCUMENTS
  { 
    key: "PART6_DOCS_CLARIFICATION", 
    label: "Documents List Clarification", 
    part: 6, 
    clientVisible: true, 
    description: "Clarifying document requirements with client", 
    importance: "high",
    links: [
      {
        id: 'document-checklist',
        label: 'Document Checklist',
        targetType: 'document',
        payload: { type: 'checklist' },
        status: 'available',
        description: 'Review required documents checklist'
      },
      {
        id: 'email-client',
        label: 'Email Client',
        targetType: 'email',
        payload: { template: 'document-clarification' },
        status: 'pending',
        description: 'Send document clarification email'
      }
    ]
  },
  { key: "PART6_GATHERING_DOCS", label: "Gathering Local Documents", part: 6, clientVisible: true, description: "Collecting local documents from client", importance: "high" },
  { key: "PART6_LOCAL_AGENT", label: "Local Agent Advising", part: 6, clientVisible: true, description: "Advising by local agent", importance: "medium" },
  { key: "PART6_PARTNER_CONNECTION", label: "Partner Connection", part: 6, clientVisible: true, description: "Connecting to our partners to help collecting documents", isMilestone: true, importance: "high" },
  { key: "PART6_RECEIVING_DOCS", label: "Receiving Documents", part: 6, clientVisible: true, description: "Receiving documents from client/partners", importance: "high" },
  { key: "PART6_EXAMINING_DOCS", label: "Examining Documents", part: 6, clientVisible: true, description: "Examining and choosing documents to translate and file", importance: "medium" },

  // PART 7 - POLISH DOCUMENTS
  { key: "PART7_POLISH_ARCHIVES", label: "Polish Archives Search", part: 7, clientVisible: true, description: "Polish archives search", importance: "high" },
  { key: "PART7_INTERNATIONAL_ARCHIVES", label: "International Archives Search", part: 7, clientVisible: true, description: "International archives search", importance: "medium" },
  { key: "PART7_FAMILY_POSSESSIONS", label: "Family Possessions Search", part: 7, clientVisible: true, description: "Family possessions search for old Polish documents", importance: "medium" },
  { key: "PART7_PARTNER_PROCESSORS", label: "Partner Processors", part: 7, clientVisible: true, description: "Connecting to our partners to process each search", isMilestone: true, importance: "high" },
  { key: "PART7_RECEIVING_ARCHIVAL", label: "Receiving Archival Documents", part: 7, clientVisible: true, description: "Receiving archival documents", importance: "high" },
  { key: "PART7_EXAMINING_ARCHIVAL", label: "Examining Archival Documents", part: 7, clientVisible: false, description: "Examining archival documents for translation and filing", importance: "medium" },

  // PART 8 - TRANSLATIONS
  { 
    key: "PART8_AI_TRANSLATIONS", 
    label: "AI Translation Service", 
    part: 8, 
    clientVisible: true, 
    description: "Translations using AI translation service on portal", 
    importance: "high",
    links: [
      {
        id: 'translation-tasks',
        label: 'Translation Tasks',
        targetType: 'tasks',
        payload: { filter: 'translation' },
        status: 'active',
        count: 5,
        description: 'Manage document translation tasks'
      },
      {
        id: 'translated-docs',
        label: 'Translated Documents',
        targetType: 'document',
        payload: { type: 'translations' },
        status: 'pending',
        description: 'Review translated document files'
      }
    ]
  },
  { key: "PART8_CERTIFIED_TRANSLATIONS", label: "Certified Translations", part: 8, clientVisible: true, description: "Certifying translations with Polish Certified Sworn Translator", importance: "critical" },
  { key: "PART8_TRANSLATIONS_AGENT", label: "Translations Agent Supervision", part: 8, clientVisible: true, description: "Dedicated translations agent supervision", isMilestone: true, importance: "high" },
  { key: "PART8_DOUBLE_CHECK", label: "Independent Double-Check", part: 8, clientVisible: true, description: "Double-checking translations by independent agent", importance: "high" },

  // PART 9 - FILING DOCUMENTS
  { key: "PART9_SUBMIT_LOCAL_DOCS", label: "Submit Local Documents", part: 9, clientVisible: true, description: "Submitting birth, marriage certificates, naturalization acts, military records", importance: "critical" },
  { key: "PART9_SUBMIT_FAMILY_INFO", label: "Submit Family Information", part: 9, clientVisible: true, description: "Submitting detailed family information", importance: "high" },
  { key: "PART9_BEFORE_INITIAL_RESPONSE", label: "Complete Before Initial Response", part: 9, clientVisible: false, description: "Completing all filing before initial response if possible", importance: "medium" },

  // PART 10 - CIVIL ACTS
  { 
    key: "PART10_CIVIL_ACTS_PREP", 
    label: "Civil Acts Applications", 
    part: 10, 
    clientVisible: true, 
    description: "Preparing Polish civil acts applications", 
    importance: "high",
    links: [
      {
        id: 'civil-acts-forms',
        label: 'Civil Acts Forms',
        targetType: 'application',
        payload: { type: 'civil-acts' },
        status: 'available',
        description: 'Access Polish civil acts application forms'
      },
      {
        id: 'civil-acts-tasks',
        label: 'Civil Acts Tasks',
        targetType: 'tasks',
        payload: { filter: 'civil-acts' },
        status: 'pending',
        count: 2,
        description: 'Track civil acts preparation progress'
      }
    ]
  },
  { key: "PART10_CIVIL_ACTS_PAYMENT", label: "Civil Acts Payment", part: 10, clientVisible: true, description: "Charging payment for Polish civil acts", isMilestone: true, importance: "critical" },
  { key: "PART10_CIVIL_ACTS_AGENT", label: "Civil Acts Agent", part: 10, clientVisible: true, description: "Supervised by dedicated civil acts agent", isMilestone: true, importance: "high" },
  { key: "PART10_SUBMIT_TO_REGISTRY", label: "Submit to Civil Registry", part: 10, clientVisible: true, description: "Submitting to relevant Polish Civil Registry office", importance: "critical" },
  { key: "PART10_RECEIVE_CERTIFICATES", label: "Receive Polish Certificates", part: 10, clientVisible: true, description: "Receiving Polish birth and marriage certificates", importance: "high" },

  // PART 11 - INITIAL RESPONSE
  { key: "PART11_INITIAL_RESPONSE", label: "Initial Response Received", part: 11, clientVisible: true, description: "Receiving initial response from Masovian Voivoda's office", importance: "critical" },
  { key: "PART11_EVALUATE_DEMANDS", label: "Evaluate Government Demands", part: 11, clientVisible: false, description: "Evaluation of demands put by the government", importance: "critical" },
  { key: "PART11_SEND_COPY_EXPLANATIONS", label: "Send Copy with Explanations", part: 11, clientVisible: true, description: "Sending copy of letter with explanations to client", importance: "high" },
  { key: "PART11_EXTEND_TERM", label: "Extend Procedure Term", part: 11, clientVisible: true, description: "Extending term of citizenship procedure", isMilestone: true, importance: "high" },
  { key: "PART11_AWAIT_EVIDENCE", label: "Await Additional Evidence", part: 11, clientVisible: true, description: "Awaiting additional evidence from client", importance: "medium" },

  // PART 12 - PUSH SCHEMES
  { key: "PART12_OFFER_SCHEMES", label: "Offer Push Schemes", part: 12, clientVisible: true, description: "Offering PUSH, NUDGE, SIT-DOWN schemes", importance: "high" },
  { key: "PART12_EXPLAIN_SCHEMES", label: "Explain Schemes", part: 12, clientVisible: true, description: "Explaining schemes in detail", importance: "medium" },
  { key: "PART12_SCHEME_PAYMENTS", label: "Scheme Payments", part: 12, clientVisible: true, description: "Payments for the schemes", importance: "high" },
  { key: "PART12_IMPLEMENT_SCHEMES", label: "Implement Schemes", part: 12, clientVisible: true, description: "Introducing the schemes in practice", isMilestone: true, importance: "critical" },
  { key: "PART12_SECOND_RESPONSE", label: "Second Government Response", part: 12, clientVisible: true, description: "Receiving 2nd response from government", importance: "critical" },
  { key: "PART12_RE_IMPLEMENT_SCHEMES", label: "Re-implement Schemes", part: 12, clientVisible: true, description: "Introducing schemes again", isMilestone: true, importance: "high" },

  // PART 13 - CITIZENSHIP DECISION
  { key: "PART13_CITIZENSHIP_CONFIRMATION", label: "Citizenship Confirmation", part: 13, clientVisible: true, description: "Polish citizenship confirmation decision received", importance: "critical" },
  { key: "PART13_EMAIL_DECISION", label: "Email Decision Copy", part: 13, clientVisible: true, description: "Emailing decision copy and adding to portal account", importance: "high" },
  { key: "PART13_APPEAL_IF_NEGATIVE", label: "Appeal if Negative", part: 13, clientVisible: false, description: "Preparing appeal to Ministry of Interior (2 weeks max)", importance: "critical" },

  // PART 14 - POLISH PASSPORT
  { key: "PART14_PASSPORT_DOCS_PREP", label: "Passport Documents Prep", part: 14, clientVisible: true, description: "Preparing all documents for Polish passport application", importance: "high" },
  { key: "PART14_FINAL_PAYMENT", label: "Final Payment", part: 14, clientVisible: true, description: "Charging the final payment", isMilestone: true, importance: "critical" },
  { key: "PART14_FEDEX_DOCUMENTS", label: "FedEx Documents", part: 14, clientVisible: true, description: "Sending all documents by FedEx", importance: "high" },
  { key: "PART14_SCHEDULE_CONSULATE", label: "Schedule Consulate Visit", part: 14, clientVisible: true, description: "Scheduling visit at Polish Consulate", importance: "high" },
  { key: "PART14_CLIENT_PASSPORT_APPLICATION", label: "Client Passport Application", part: 14, clientVisible: false, description: "Client applies for the passport", importance: "critical" },
  { key: "PART14_PASSPORT_OBTAINED", label: "Polish Passport Obtained", part: 14, clientVisible: true, description: "Polish passport successfully obtained", isMilestone: true, importance: "critical" },

  // PART 15 - EXTENDED SERVICES
  { key: "PART15_EXTENDED_SERVICES", label: "Extended Family Legal Services", part: 15, clientVisible: false, description: "Extended family legal services", isMilestone: true, importance: "low" },
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
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [stageStatus, setStageStatus] = useState<Record<string, 'pending' | 'active' | 'completed' | 'blocked'>>({});

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

  // Enhanced stage management handlers
  const handleExpandStage = useCallback((stageKey: string) => {
    setExpandedStage(expandedStage === stageKey ? null : stageKey);
  }, [expandedStage]);

  const handleStageStatusChange = useCallback((stageKey: string, status: 'pending' | 'active' | 'completed' | 'blocked') => {
    setStageStatus(prev => ({
      ...prev,
      [stageKey]: status
    }));
    
    const stage = COMPREHENSIVE_PIPELINE.find(s => s.key === stageKey);
    toast({
      title: "Stage Status Updated",
      description: `${stage?.label} marked as ${status}`,
    });
  }, [toast]);

  const handleStageNotesUpdate = useCallback((stageKey: string, notes: string) => {
    setStageNotes(prev => ({
      ...prev,
      [stageKey]: notes
    }));
  }, []);

  const handleSaveStageEdit = useCallback((stageKey: string) => {
    setIsEditing(null);
    const stage = COMPREHENSIVE_PIPELINE.find(s => s.key === stageKey);
    toast({
      title: "Stage Saved",
      description: `Changes to ${stage?.label} have been saved`,
    });
  }, [toast]);

  const handleCancelStageEdit = useCallback(() => {
    setIsEditing(null);
    toast({
      title: "Edit Cancelled",
      description: "Changes discarded",
    });
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
      {/* Simple Legend */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Polish Citizenship Case Pipeline</h3>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">High Priority</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Medium Priority</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Low Priority</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Case Age: {ageDays} days • {COMPREHENSIVE_PIPELINE.length} stages total
          </div>
        </div>
      </div>

      {/* Progress Overview Dashboard */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Overview</h3>
        
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

      {/* Interactive Stage Pipeline */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stage Pipeline
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {COMPREHENSIVE_PIPELINE.length} stages total
          </div>
        </div>
        
        <div className="relative">
          <div className="flex overflow-x-auto gap-3 pb-4">
            {COMPREHENSIVE_PIPELINE.map((stage, i) => {
              const isActive = i === activeIdx;
              const isCompleted = i < activeIdx;
              
              // Get importance-based background colors
              const getImportanceStyles = (importance?: string) => {
                if (isActive) {
                  return "border-blue-600 bg-blue-600 text-white shadow-lg";
                }
                if (isCompleted) {
                  return "border-green-600 bg-green-600 text-white";
                }
                
                switch (importance) {
                  case 'critical':
                    return "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-red-900 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900/30";
                  case 'high':
                    return "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30";
                  case 'medium':
                    return "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/30";
                  case 'low':
                  default:
                    return "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                }
              };
              
              return (
                <div 
                  key={stage.key} 
                  className={cn(
                    "flex-shrink-0 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    "min-w-[140px] text-center", // Bigger stages
                    getImportanceStyles(stage.importance)
                  )}
                  onClick={() => handleMarkActive(stage.key)}
                  title={`${stage.label} - ${stage.description} (Part ${stage.part})${stage.importance ? ` - ${stage.importance.toUpperCase()} priority` : ''}`}
                  data-testid={`stage-chip-${stage.key}`}
                >
                  <div className="space-y-1">
                    {/* Stage Number */}
                    <div className="text-sm font-bold">
                      {isCompleted ? "✓" : i + 1}
                    </div>
                    
                    {/* Stage Name */}
                    <div className="text-xs font-medium leading-tight flex items-center justify-center gap-1">
                      {stage.label}
                      {stage.links && stage.links.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" title="Has related work"></div>
                      )}
                    </div>
                    
                    {/* Part Number */}
                    <div className="text-xs opacity-70">
                      Part {stage.part}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Management */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stage Management
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Current: {COMPREHENSIVE_PIPELINE[activeIdx]?.label || 'None'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Stages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Pending Stages</h4>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {COMPREHENSIVE_PIPELINE.filter((_, i) => i > activeIdx).map((stage, index) => (
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
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{stage.label}</span>
                      {stage.links && stage.links.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" title="Has related work"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {stage.clientVisible && <span className="text-xs text-green-600 dark:text-green-400">Client</span>}
                      {stage.isMilestone && <span className="text-xs text-yellow-600 dark:text-yellow-400">Milestone</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{stage.description?.slice(0, 50)}...</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Part {stage.part}</span>
                    <div className="flex gap-1">
                      <button 
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        data-testid={`button-mark-active-${stage.key}`}
                        onClick={() => handleMarkActive(stage.key)}
                      >
                        Activate
                      </button>
                      <button 
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        data-testid={`button-expand-${stage.key}`}
                        onClick={() => handleExpandStage(stage.key)}
                      >
                        {expandedStage === stage.key ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Stage Details for Pending Stages */}
                  {expandedStage === stage.key && (
                    <div className="mt-3 p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Full Description</label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{stage.description}</p>
                        </div>
                        
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Stage Notes</label>
                          <textarea
                            className="w-full text-xs p-2 border border-gray-200 dark:border-gray-600 rounded resize-none h-16 bg-white dark:bg-gray-900"
                            placeholder="Add notes for this stage..."
                            value={stageNotes[stage.key] || ''}
                            onChange={(e) => handleStageNotesUpdate(stage.key, e.target.value)}
                            data-testid={`textarea-notes-${stage.key}`}
                          />
                        </div>
                        
                        {/* Related Work Section */}
                        {stage.links && stage.links.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">Related Work</label>
                            <div className="space-y-2">
                              {stage.links.map(link => (
                                <div key={link.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-900 dark:text-white">{link.label}</span>
                                      {link.count && (
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                                          {link.count}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ml-2"
                                    onClick={() => {
                                      if (link.route) {
                                        // Navigate to route - will implement routing logic
                                        toast({
                                          title: "Navigation",
                                          description: `Opening ${link.label}...`,
                                        });
                                      } else {
                                        toast({
                                          title: "Action",
                                          description: `Executing ${link.label}...`,
                                        });
                                      }
                                    }}
                                    data-testid={`button-link-${link.id}`}
                                  >
                                    Open
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Status</label>
                            <select
                              className="text-xs p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                              value={stageStatus[stage.key] || 'pending'}
                              onChange={(e) => handleStageStatusChange(stage.key, e.target.value as any)}
                              data-testid={`select-status-${stage.key}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>
                          
                          <div className="flex gap-1">
                            <button 
                              className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              onClick={() => handleSaveStageEdit(stage.key)}
                              data-testid={`button-save-${stage.key}`}
                            >
                              Save
                            </button>
                            <button 
                              className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              onClick={handleCancelStageEdit}
                              data-testid={`button-cancel-${stage.key}`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Stage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Active Stage</h4>
            </div>
            {COMPREHENSIVE_PIPELINE[activeIdx] && (
              <div className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">{COMPREHENSIVE_PIPELINE[activeIdx].label}</span>
                  <button 
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    onClick={() => handleExpandStage(COMPREHENSIVE_PIPELINE[activeIdx].key)}
                    data-testid="button-edit-active-stage"
                  >
                    {expandedStage === COMPREHENSIVE_PIPELINE[activeIdx].key ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                
                <div className="text-sm text-blue-800 dark:text-blue-200 mb-3">{COMPREHENSIVE_PIPELINE[activeIdx].description}</div>
                
                {/* Enhanced Active Stage Details */}
                {expandedStage === COMPREHENSIVE_PIPELINE[activeIdx].key && (
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Current Stage Progress Notes</label>
                        <textarea
                          className="w-full text-xs p-2 border border-gray-200 dark:border-gray-600 rounded resize-none h-20 bg-white dark:bg-gray-900"
                          placeholder="Add progress notes, blockers, or next steps for this active stage..."
                          value={stageNotes[COMPREHENSIVE_PIPELINE[activeIdx].key] || ''}
                          onChange={(e) => handleStageNotesUpdate(COMPREHENSIVE_PIPELINE[activeIdx].key, e.target.value)}
                          data-testid="textarea-active-stage-notes"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Dependencies:</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">
                            {activeIdx > 0 ? `Requires completion of Part ${COMPREHENSIVE_PIPELINE[activeIdx - 1]?.part} stages` : 'No dependencies'}
                          </span>
                        </div>
                        
                        {/* Active Stage Related Work */}
                        {COMPREHENSIVE_PIPELINE[activeIdx].links && COMPREHENSIVE_PIPELINE[activeIdx].links!.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">Quick Actions</label>
                            <div className="space-y-1">
                              {COMPREHENSIVE_PIPELINE[activeIdx].links!.map(link => (
                                <div key={link.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">{link.label}</span>
                                  </div>
                                  <button 
                                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    onClick={() => {
                                      toast({
                                        title: "Quick Action",
                                        description: `Opening ${link.label}...`,
                                      });
                                    }}
                                    data-testid={`button-active-link-${link.id}`}
                                  >
                                    Go
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          <button 
                            className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                            onClick={() => handleStageStatusChange(COMPREHENSIVE_PIPELINE[activeIdx].key, 'blocked')}
                            data-testid="button-block-active-stage"
                          >
                            Block
                          </button>
                          <button 
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            onClick={() => handleSaveStageEdit(COMPREHENSIVE_PIPELINE[activeIdx].key)}
                            data-testid="button-save-active-stage"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400">Part {COMPREHENSIVE_PIPELINE[activeIdx].part}</span>
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full text-blue-800 dark:text-blue-200">
                      Stage {activeIdx + 1} of {COMPREHENSIVE_PIPELINE.length}
                    </span>
                  </div>
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
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {COMPREHENSIVE_PIPELINE.filter((_, i) => i < activeIdx).reverse().map((stage) => (
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
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-green-900 dark:text-green-100">{stage.label}</span>
                      {stage.links && stage.links.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" title="Has related work"></div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mb-2">{stage.description?.slice(0, 50)}...</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 dark:text-green-400">Part {stage.part}</span>
                    <div className="flex gap-1">
                      <button 
                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        data-testid={`button-review-${stage.key}`}
                        onClick={() => handleStageReview(stage.key)}
                      >
                        Review
                      </button>
                      <button 
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        data-testid={`button-expand-completed-${stage.key}`}
                        onClick={() => handleExpandStage(stage.key)}
                      >
                        {expandedStage === stage.key ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Stage Details for Completed Stages */}
                  {expandedStage === stage.key && (
                    <div className="mt-3 p-3 border-t border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10 rounded-b-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-green-700 dark:text-green-300 block mb-1">Completion Summary</label>
                          <p className="text-xs text-green-600 dark:text-green-400">{stage.description}</p>
                        </div>
                        
                        {/* Action Items Reference Section for Completed Stages */}
                        {stage.actionItems && stage.actionItems.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-green-700 dark:text-green-300 block mb-2">Actions That Were Completed</label>
                            <div className="space-y-2">
                              {stage.actionItems.map((action, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded opacity-75">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="text-sm">{action.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-green-800 dark:text-green-200 truncate line-through">{action.title}</div>
                                      <div className="text-xs text-green-600 dark:text-green-400 truncate">{action.description}</div>
                                    </div>
                                    <span className="text-xs text-green-600 dark:text-green-400">✓ Done</span>
                                  </div>
                                  {action.link && (
                                    <button
                                      className="ml-2 text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                      onClick={() => action.link && (window.location.href = action.link)}
                                      data-testid={`button-completed-action-${stage.key}-${idx}`}
                                    >
                                      View
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-xs font-medium text-green-700 dark:text-green-300 block mb-1">Completion Notes & Outcomes</label>
                          <textarea
                            className="w-full text-xs p-2 border border-green-200 dark:border-green-600 rounded resize-none h-16 bg-white dark:bg-gray-900"
                            placeholder="Document what was accomplished, outcomes, and any issues resolved..."
                            value={stageNotes[stage.key] || ''}
                            onChange={(e) => handleStageNotesUpdate(stage.key, e.target.value)}
                            data-testid={`textarea-completed-notes-${stage.key}`}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs">
                          </div>
                          
                          <div className="flex gap-1">
                            <button 
                              className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                              onClick={() => handleMarkActive(stage.key)}
                              data-testid={`button-reopen-${stage.key}`}
                            >
                              Reopen
                            </button>
                            <button 
                              className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              onClick={() => handleSaveStageEdit(stage.key)}
                              data-testid={`button-save-completed-${stage.key}`}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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