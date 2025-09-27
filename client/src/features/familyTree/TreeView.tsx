import React from 'react';
import { FamilyTreeData, NodeStatus } from './types';
import { getNodeStatus, getRequiredFields } from './eligibilityLogic';
import { formatPL } from '@/lib/dateFormat';
import { cn } from '@/lib/utils';

interface TreeViewProps {
  data: FamilyTreeData;
  className?: string;
}

interface TreeNodeProps {
  title: string;
  person: any;
  spouse?: string;
  children?: React.ReactNode;
  status: NodeStatus;
  className?: string;
}

const StatusChip: React.FC<{ status: NodeStatus }> = ({ status }) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  const statusClasses = {
    ok: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
    missing: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const statusText = {
    ok: "OK",
    partial: "PARTIAL",
    missing: "MISSING DOCS"
  };

  return (
    <span className={cn(baseClasses, statusClasses[status.level])}>
      {statusText[status.level]}
    </span>
  );
};

const TreeNode: React.FC<TreeNodeProps> = ({ title, person, spouse, children, status, className }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return formatPL(new Date(dateStr));
    } catch {
      return dateStr; // Return as-is if parsing fails
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Connection line to parent */}
      <div className="absolute top-0 left-1/2 w-px h-6 bg-[var(--pc-border)] -translate-x-1/2"></div>
      
      <div className="pc-card p-4 mx-auto max-w-sm bg-[var(--pc-card)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--pc-text-primary)] text-sm">{title}</h4>
          <StatusChip status={status} />
        </div>

        {/* Main person */}
        <div className="space-y-2">
          <div className="font-medium text-[var(--pc-text-primary)]">
            {person.full_name || person.applicant_full_name || person.polish_parent_full_name || 
             person.polish_grandparent_full_name || person.great_grandfather_full_name || 
             <span className="text-[var(--pc-text-dim)] italic">Click "Edit Details" to add information</span>}
          </div>
          
          {/* Birth info */}
          {(person.date_of_birth || person.applicant_date_of_birth || person.polish_parent_date_of_birth || 
            person.polish_grandparent_date_of_birth || person.great_grandfather_date_of_birth) && (
            <div className="text-sm text-[var(--pc-text-dim)]">
              Born: {formatDate(person.date_of_birth || person.applicant_date_of_birth || 
                               person.polish_parent_date_of_birth || person.polish_grandparent_date_of_birth ||
                               person.great_grandfather_date_of_birth)}
              {(person.place_of_birth || person.applicant_place_of_birth || person.polish_parent_place_of_birth ||
                person.polish_grandparent_place_of_birth || person.great_grandfather_place_of_birth) && (
                <span> in {person.place_of_birth || person.applicant_place_of_birth || 
                          person.polish_parent_place_of_birth || person.polish_grandparent_place_of_birth ||
                          person.great_grandfather_place_of_birth}</span>
              )}
            </div>
          )}

          {/* Marriage info */}
          {(person.date_of_marriage || person.applicant_date_of_marriage || person.polish_parent_date_of_marriage || 
            person.polish_grandparent_date_of_mariage || person.great_grandfather_date_of_marriage) && (
            <div className="text-sm text-[var(--pc-text-dim)]">
              Married: {formatDate(person.date_of_marriage || person.applicant_date_of_marriage || 
                                  person.polish_parent_date_of_marriage || person.polish_grandparent_date_of_mariage ||
                                  person.great_grandfather_date_of_marriage)}
              {(person.place_of_marriage || person.applicant_place_of_marriage || person.polish_parent_place_of_marriage ||
                person.polish_grandparent_place_of_mariage || person.great_grandfather_place_of_marriage) && (
                <span> in {person.place_of_marriage || person.applicant_place_of_marriage || 
                          person.polish_parent_place_of_marriage || person.polish_grandparent_place_of_mariage ||
                          person.great_grandfather_place_of_marriage}</span>
              )}
            </div>
          )}

          {/* Emigration/Naturalization for Polish ancestors */}
          {(person.polish_parent_date_of_emigration || person.polish_grandparent_date_of_emigration) && (
            <div className="text-sm text-[var(--pc-text-dim)]">
              Emigrated: {formatDate(person.polish_parent_date_of_emigration || person.polish_grandparent_date_of_emigration)}
            </div>
          )}
          
          {(person.polish_parent_date_of_naturalization || person.polish_grandparent_date_of_naturalization || 
            person.great_grandfather_date_of_naturalization) && (
            <div className="text-sm text-[var(--pc-text-dim)]">
              Naturalized: {formatDate(person.polish_parent_date_of_naturalization || 
                                      person.polish_grandparent_date_of_naturalization ||
                                      person.great_grandfather_date_of_naturalization)}
            </div>
          )}
        </div>

        {/* Spouse */}
        {spouse && (
          <div className="mt-3 pt-3 border-t border-[var(--pc-border)]">
            <div className="text-sm text-[var(--pc-text-dim)]">Spouse:</div>
            <div className="text-sm font-medium text-[var(--pc-text-primary)]">{spouse}</div>
          </div>
        )}

        {/* Children */}
        {children}
      </div>

      {/* Connection line to children */}
      <div className="absolute bottom-0 left-1/2 w-px h-6 bg-[var(--pc-border)] -translate-x-1/2"></div>
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({ data, className }) => {
  // Calculate node statuses
  const applicantStatus = getNodeStatus(data.applicant, getRequiredFields('applicant'));
  const polishParentStatus = getNodeStatus(data.polishParent, getRequiredFields('polishParent'));
  const polishGrandparentStatus = getNodeStatus(data.polishGrandparent, getRequiredFields('polishGrandparent'));
  const greatGrandparentsStatus = getNodeStatus(data.greatGrandparents, getRequiredFields('greatGrandparents'));

  const hasAnyData = data.applicant.applicant_full_name || data.polishParent.polish_parent_full_name || 
                    data.polishGrandparent.polish_grandparent_full_name || data.greatGrandparents.great_grandfather_full_name;

  return (
    <div className={cn("pc-card p-6 bg-[var(--pc-panel)] min-h-[500px]", className)}>
      <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-6 text-center">
        Family Tree Visualization
      </h3>
      
      {!hasAnyData && (
        <div className="mb-6 p-4 bg-[var(--pc-info-bg)] border border-[var(--pc-info-border)] rounded-lg">
          <div className="text-sm text-[var(--pc-info-text)] text-center">
            📋 <strong>Empty Family Tree</strong> - Use "Edit Details" tab to add family information and see the complete 4-generation visualization
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* APPLICANT Level */}
        <TreeNode
          title="APPLICANT"
          person={data.applicant}
          spouse={data.applicant.applicant_spouse_full_name_and_maiden_name}
          status={applicantStatus}
          children={
            data.minorChildren.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--pc-border)]">
                <div className="text-sm text-[var(--pc-text-dim)] mb-2">Minor Children:</div>
                <div className="space-y-1">
                  {data.minorChildren.map((child, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-[var(--pc-text-primary)]">
                        {child.minor_full_name || `Child ${index + 1}`}
                      </div>
                      {child.minor_date_of_birth && (
                        <div className="text-xs text-[var(--pc-text-dim)]">
                          Born: {formatPL(new Date(child.minor_date_of_birth))}
                          {child.minor_place_of_birth && ` in ${child.minor_place_of_birth}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        />

        {/* POLISH PARENT Level */}
        <TreeNode
          title="POLISH PARENT"
          person={data.polishParent}
          spouse={data.polishParent.polish_parent_spouse_full_name}
          status={polishParentStatus}
        />

        {/* POLISH GRANDPARENT Level */}
        <TreeNode
          title="POLISH GRANDPARENT"
          person={data.polishGrandparent}
          spouse={data.polishGrandparent.polish_grandparent_spouse_full_name}
          status={polishGrandparentStatus}
        />

        {/* GREAT GRANDPARENTS Level */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 w-px h-6 bg-[var(--pc-border)] -translate-x-1/2"></div>
          
          <div className="pc-card p-4 mx-auto max-w-sm bg-[var(--pc-card)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[var(--pc-text-primary)] text-sm">GREAT GRANDPARENTS</h4>
              <StatusChip status={greatGrandparentsStatus} />
            </div>

            {/* Great Grandfather (REQUIRED) */}
            <div className="space-y-2">
              <div className="font-medium text-[var(--pc-text-primary)]">
                {data.greatGrandparents.great_grandfather_full_name || 
                 <span className="text-[var(--pc-danger)]">Great Grandfather (REQUIRED) - Click "Edit Details" to add</span>}
              </div>
              
              {data.greatGrandparents.great_grandfather_date_of_birth && (
                <div className="text-sm text-[var(--pc-text-dim)]">
                  Born: {formatPL(new Date(data.greatGrandparents.great_grandfather_date_of_birth))}
                  {data.greatGrandparents.great_grandfather_place_of_birth && 
                   ` in ${data.greatGrandparents.great_grandfather_place_of_birth}`}
                </div>
              )}
            </div>

            {/* Great Grandmother (Optional) */}
            {data.greatGrandparents.great_grandmother_full_name && (
              <div className="mt-3 pt-3 border-t border-[var(--pc-border)]">
                <div className="text-sm text-[var(--pc-text-dim)]">Spouse:</div>
                <div className="text-sm font-medium text-[var(--pc-text-primary)]">
                  {data.greatGrandparents.great_grandmother_full_name}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Eligibility Path Info */}
      <div className="mt-8 p-4 bg-[var(--pc-panel-elev)] rounded-lg">
        <div className="text-sm font-medium text-[var(--pc-text-primary)] mb-2">
          Eligibility Path:
        </div>
        <div className="text-sm text-[var(--pc-text-dim)]">
          Applicant → Polish Parent (any gender) → Polish Grandparent (any gender) → Great Grandfather (male REQUIRED)
        </div>
        {!data.greatGrandparents.great_grandfather_full_name && (
          <div className="mt-2 text-sm text-[var(--pc-danger)]">
            ⚠️ Male ancestor at great-grandparent level is required for eligibility
          </div>
        )}
      </div>
    </div>
  );
};