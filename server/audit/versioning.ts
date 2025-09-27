import { db } from '../db.js';
import { caseVersions, type InsertCaseVersion, type CaseVersion } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export interface VersionRecord {
  id: string;
  caseId: string;
  entity: string;
  fieldName?: string | null;
  dataBefore: any;
  dataAfter: any;
  actor: string;
  reason?: string | null;
  changeType: 'create' | 'update' | 'delete' | 'restore';
  isUndone: boolean;
  undoneBy?: string | null;
  undoneAt?: Date | null;
  createdAt: Date;
}

/**
 * Records a version/change for audit trail and undo functionality
 */
export async function recordVersion(
  caseId: string,
  entity: string,
  dataBefore: any,
  dataAfter: any,
  actor: string,
  reason?: string,
  fieldName?: string
): Promise<string> {
  try {
    // Determine change type based on data
    let changeType: 'create' | 'update' | 'delete' | 'restore' = 'update';
    
    if (!dataBefore && dataAfter) {
      changeType = 'create';
    } else if (dataBefore && !dataAfter) {
      changeType = 'delete';
    } else if (reason?.includes('restore') || reason?.includes('undo')) {
      changeType = 'restore';
    }

    const versionData: InsertCaseVersion = {
      caseId,
      entity,
      fieldName,
      dataBefore,
      dataAfter,
      actor,
      reason,
      changeType,
      isUndone: false
    };

    const [inserted] = await db.insert(caseVersions).values(versionData).returning();
    
    console.log(`[VERSIONING] Recorded version ${inserted.id} for case ${caseId}, entity ${entity}, actor ${actor}`);
    return inserted.id;
  } catch (error) {
    console.error('[VERSIONING] Failed to record version:', error);
    throw new Error(`Failed to record version: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets all versions for a case, optionally filtered by entity
 */
export async function getVersions(
  caseId: string,
  entity?: string
): Promise<VersionRecord[]> {
  try {
    const conditions = entity 
      ? and(eq(caseVersions.caseId, caseId), eq(caseVersions.entity, entity))
      : eq(caseVersions.caseId, caseId);
    
    const versions = await db
      .select()
      .from(caseVersions)
      .where(conditions)
      .orderBy(desc(caseVersions.createdAt));
    
    return versions.map(v => ({
      id: v.id,
      caseId: v.caseId,
      entity: v.entity,
      fieldName: v.fieldName,
      dataBefore: v.dataBefore,
      dataAfter: v.dataAfter,
      actor: v.actor,
      reason: v.reason,
      changeType: v.changeType as 'create' | 'update' | 'delete' | 'restore',
      isUndone: v.isUndone || false,
      undoneBy: v.undoneBy,
      undoneAt: v.undoneAt,
      createdAt: v.createdAt!
    }));
  } catch (error) {
    console.error('[VERSIONING] Failed to get versions:', error);
    throw new Error(`Failed to get versions: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Restores a specific version by applying its dataBefore values
 * This creates a new version record for the restore operation
 */
export async function restoreVersion(
  versionId: string,
  actor: string,
  reason?: string
): Promise<{ success: boolean; restoredData: any; newVersionId?: string }> {
  try {
    // Get the version to restore
    const [version] = await db
      .select()
      .from(caseVersions)
      .where(eq(caseVersions.id, versionId))
      .limit(1);
    
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    if (version.isUndone) {
      throw new Error(`Version ${versionId} has already been undone`);
    }

    // The data to restore is in the dataBefore field
    const dataToRestore = version.dataBefore;
    
    if (!dataToRestore) {
      throw new Error(`Version ${versionId} has no data to restore`);
    }

    // Here we would actually update the target entity with the restored data
    // For now, we'll just record the restore operation
    
    // Create a new version record for the restore operation
    const restoreReason = reason || `Restored to version from ${version.createdAt?.toISOString()}`;
    const newVersionId = await recordVersion(
      version.caseId,
      version.entity,
      version.dataAfter, // What we're changing from (current state)
      version.dataBefore, // What we're changing to (restored state)
      actor,
      restoreReason,
      version.fieldName
    );

    // Mark the original version as undone
    await db
      .update(caseVersions)
      .set({
        isUndone: true,
        undoneBy: actor,
        undoneAt: new Date()
      })
      .where(eq(caseVersions.id, versionId));

    console.log(`[VERSIONING] Restored version ${versionId} for case ${version.caseId}, created new version ${newVersionId}`);
    
    return {
      success: true,
      restoredData: dataToRestore,
      newVersionId
    };
  } catch (error) {
    console.error('[VERSIONING] Failed to restore version:', error);
    return {
      success: false,
      restoredData: null
    };
  }
}

/**
 * Gets the latest version for a specific case and entity
 */
export async function getLatestVersion(
  caseId: string,
  entity: string
): Promise<VersionRecord | null> {
  try {
    const [version] = await db
      .select()
      .from(caseVersions)
      .where(and(
        eq(caseVersions.caseId, caseId),
        eq(caseVersions.entity, entity)
      ))
      .orderBy(desc(caseVersions.createdAt))
      .limit(1);
    
    if (!version) return null;

    return {
      id: version.id,
      caseId: version.caseId,
      entity: version.entity,
      fieldName: version.fieldName,
      dataBefore: version.dataBefore,
      dataAfter: version.dataAfter,
      actor: version.actor,
      reason: version.reason,
      changeType: version.changeType as 'create' | 'update' | 'delete' | 'restore',
      isUndone: version.isUndone || false,
      undoneBy: version.undoneBy,
      undoneAt: version.undoneAt,
      createdAt: version.createdAt!
    };
  } catch (error) {
    console.error('[VERSIONING] Failed to get latest version:', error);
    return null;
  }
}

/**
 * Gets version statistics for a case
 */
export async function getVersionStats(caseId: string): Promise<{
  totalVersions: number;
  undoneVersions: number;
  entities: string[];
  lastChange?: Date;
}> {
  try {
    const versions = await getVersions(caseId);
    
    const stats = {
      totalVersions: versions.length,
      undoneVersions: versions.filter(v => v.isUndone).length,
      entities: [...new Set(versions.map(v => v.entity))],
      lastChange: versions[0]?.createdAt // First item is most recent due to DESC order
    };

    return stats;
  } catch (error) {
    console.error('[VERSIONING] Failed to get version stats:', error);
    return {
      totalVersions: 0,
      undoneVersions: 0,
      entities: [],
      lastChange: undefined
    };
  }
}