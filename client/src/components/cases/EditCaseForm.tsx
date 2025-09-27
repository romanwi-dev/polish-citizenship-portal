import { useState } from "react";

interface EditCaseFormProps {
  formData: any;
  setFormData: (value: any) => void;
  caseData: any;
  isSaving: boolean;
  onClose: () => void;
  handleSave: () => void;
}

export function EditCaseForm({ formData, setFormData, caseData, isSaving, onClose, handleSave }: EditCaseFormProps) {
  // Fix crash: provide default empty object if formData is undefined
  const safeFormData = formData || {};
  
  return (
    <div className="edit-form edit-panel-scroll" style={{ fontSize: '16px' }}>
      <p className="agent-form-label text-sm mb-4 opacity-80">
        Update case information for {caseData?.client?.name || `Case ${caseData?.id}`}
      </p>
      
      <div className="agent-form-group">
        <label className="agent-form-label" htmlFor="clientName">Client Name *</label>
        <input
          id="clientName"
          className="agent-form-input"
          value={safeFormData.clientName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          placeholder="Enter client name"
        />
      </div>
      
      <div className="agent-form-group">
        <label className="agent-form-label" htmlFor="clientEmail">Client Email</label>
        <input
          id="clientEmail"
          type="email"
          className="agent-form-input"
          value={safeFormData.clientEmail || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
          placeholder="Enter client email"
        />
      </div>
      
      <div className="agent-form-group">
        <label className="agent-form-label" htmlFor="processing">Processing Tier</label>
        <select 
          id="processing"
          className="agent-form-input agent-form-select"
          value={safeFormData.processing || 'standard'} 
          onChange={(e) => setFormData(prev => ({ ...prev, processing: e.target.value }))}
        >
          <option value="standard">Standard</option>
          <option value="expedited">Expedited</option>
          <option value="vip">VIP</option>
          <option value="vip+">VIP+</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="agent-form-group">
          <label className="agent-form-label" htmlFor="difficulty">Difficulty (1-10)</label>
          <input
            id="difficulty"
            type="number"
            min="1"
            max="10"
            className="agent-form-input"
            value={safeFormData.difficulty || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
          />
        </div>
        
        <div className="agent-form-group">
          <label className="agent-form-label" htmlFor="clientScore">Score (0-100)</label>
          <input
            id="clientScore"
            type="number"
            min="0"
            max="100"
            className="agent-form-input"
            value={safeFormData.clientScore || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, clientScore: Number(e.target.value) }))}
          />
        </div>
      </div>
      
      <div className="agent-form-group">
        <label className="agent-form-label" htmlFor="state">Stage</label>
        <select 
          id="state"
          className="agent-form-input agent-form-select"
          value={safeFormData.state || 'INTAKE'} 
          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
        >
          <option value="INTAKE">Intake</option>
          <option value="USC_IN_FLIGHT">USC In Flight</option>
          <option value="OBY_DRAFTING">OBY Drafting</option>
          <option value="USC_READY">USC Ready</option>
          <option value="OBY_SUBMITTABLE">OBY Submittable</option>
          <option value="OBY_SUBMITTED">OBY Submitted</option>
          <option value="DECISION_RECEIVED">Decision Received</option>
        </select>
      </div>
      
      <div className="agent-form-group">
        <label className="agent-form-label" htmlFor="lineage">Lineage</label>
        <input
          id="lineage"
          className="agent-form-input"
          value={safeFormData.lineage || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, lineage: e.target.value }))}
          placeholder="Brief lineage description"
        />
      </div>
      
      <div className="agent-form-group">
        <label className="agent-form-label" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          className="agent-form-input agent-form-textarea"
          value={safeFormData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes..."
          rows={4}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <button 
          className="agent-button agent-button-secondary flex-1"
          onClick={onClose} 
          disabled={isSaving}
        >
          Cancel
        </button>
        <button 
          className="agent-button agent-button-primary flex-1"
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </button>
        <button 
          className="agent-button agent-button-primary flex-1"
          onClick={async () => {
            await handleSave();
            // Always close after "Save & Close" - handleSave will show error if it fails
            onClose();
          }} 
          disabled={isSaving}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}