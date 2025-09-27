export type CaseProgress = {
  caseId: string;
  status: 'new'|'intake'|'research'|'submitted'|'approved'|'closed';
  steps: { key:string; label:string; done:boolean; ts?:number }[];
  updatedAt: number;
};

export async function createCaseProgress(caseId: string): Promise<CaseProgress> {
  // Simplified: just create file-based progress tracking
  const fs = await import('fs/promises');
  const path = await import('path');
  await fs.mkdir('data', { recursive: true });
  const progress: CaseProgress = {
    caseId,
    status: 'new',
    steps: [
      { key:'intake',    label:'Intake complete',    done:false },
      { key:'research',  label:'Research started',   done:false },
      { key:'submitted', label:'Application filed',  done:false },
      { key:'approved',  label:'Approved',           done:false },
      { key:'closed',    label:'Closed',             done:false },
    ],
    updatedAt: Date.now(),
  };
  await fs.appendFile(path.resolve('data','progress.jsonl'), JSON.stringify(progress)+'\n', 'utf8');
  return progress;
}

export async function ensureCaseProgress(caseId:string) {
  return createCaseProgress(caseId);
}