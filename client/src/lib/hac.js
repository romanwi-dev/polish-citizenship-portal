/**
 * HAC (High-risk Action Control) client helper
 * Routes risky updates through the HAC approval system
 */

/**
 * Submit a risky update to the HAC system for approval
 * @param {string} caseId - The case ID
 * @param {string} type - The type of update (CASE_PATCH, TREE_PATCH, etc.)
 * @param {object} payload - The data to be updated
 * @returns {Promise<object>} The response from the HAC system
 * @throws {Error} If the submission fails
 */
export async function hacSubmit(caseId, type, payload) {
  try {
    const response = await fetch('/api/hac/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseId,
        type,
        payload
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit ${type} to HAC`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`HAC submission failed: ${error.message}`);
  }
}

/**
 * Common HAC submission types
 */
export const HAC_TYPES = {
  CASE_PATCH: 'CASE_PATCH',
  TREE_PATCH: 'TREE_PATCH',
  PRICING_UPDATE: 'PRICING_UPDATE',
  LINEAGE_UPDATE: 'LINEAGE_UPDATE',
  DOCUMENT_UPDATE: 'DOCUMENT_UPDATE',
  STATUS_UPDATE: 'STATUS_UPDATE',
  FORM_OBY_DRAFT: 'FORM_OBY_DRAFT'
};