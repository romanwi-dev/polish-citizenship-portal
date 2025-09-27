import React, { useState, useCallback } from 'react';
import { FamilyTreeData, MinorChild } from './types';
import { formatPL, parsePL } from '@/lib/dateFormat';
import { cn } from '@/lib/utils';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface TreeFormProps {
  data: FamilyTreeData;
  onChange: (data: FamilyTreeData) => void;
  className?: string;
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, className, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn("pc-card p-4 bg-[var(--pc-card)]", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left mb-4"
      >
        <h4 className="font-semibold text-[var(--pc-text-primary)]">{title}</h4>
        <span className={cn("transition-transform", isExpanded ? "rotate-180" : "")}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, placeholder, required, error }) => {
  const [displayValue, setDisplayValue] = useState(value ? formatPL(new Date(value)) : '');
  const [inputError, setInputError] = useState('');

  const handleChange = (inputValue: string) => {
    setDisplayValue(inputValue);
    setInputError('');
    
    if (!inputValue.trim()) {
      onChange('');
      return;
    }

    // Validate DD.MM.YYYY format
    const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!datePattern.test(inputValue)) {
      setInputError('Please use DD.MM.YYYY format');
      return;
    }

    try {
      const parsed = parsePL(inputValue);
      onChange(parsed.toISOString());
    } catch {
      setInputError('Invalid date');
    }
  };

  const handleBlur = () => {
    if (displayValue && !inputError) {
      try {
        const parsed = parsePL(displayValue);
        setDisplayValue(formatPL(parsed));
      } catch {
        // Keep current display value if parsing fails
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
        {label} {required && <span className="text-[var(--pc-danger)]">*</span>}
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder || "DD.MM.YYYY"}
        className={cn(
          "w-full px-3 py-2 border rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)]",
          "focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent",
          "placeholder:text-[var(--pc-text-dim)]",
          (error || inputError) ? "border-[var(--pc-danger)]" : "border-[var(--pc-border)]"
        )}
        data-testid={`input-date-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
      {(error || inputError) && (
        <div className="mt-1 flex items-center gap-1 text-sm text-[var(--pc-danger)]">
          <AlertCircle className="h-4 w-4" />
          {error || inputError}
        </div>
      )}
    </div>
  );
};

export const TreeForm: React.FC<TreeFormProps> = ({ data, onChange, className }) => {
  const updateField = useCallback((section: keyof FamilyTreeData, field: string, value: string) => {
    const newData = { ...data };
    (newData[section] as any)[field] = value;
    onChange(newData);
  }, [data, onChange]);

  const addMinorChild = useCallback(() => {
    if (data.minorChildren.length < 3) {
      const newData = { ...data };
      newData.minorChildren = [...data.minorChildren, {
        minor_full_name: '',
        minor_date_of_birth: '',
        minor_place_of_birth: ''
      }];
      onChange(newData);
    }
  }, [data, onChange]);

  const removeMinorChild = useCallback((index: number) => {
    const newData = { ...data };
    newData.minorChildren = data.minorChildren.filter((_, i) => i !== index);
    onChange(newData);
  }, [data, onChange]);

  const updateMinorChild = useCallback((index: number, field: keyof MinorChild, value: string) => {
    const newData = { ...data };
    newData.minorChildren = [...data.minorChildren];
    newData.minorChildren[index] = { ...newData.minorChildren[index], [field]: value };
    onChange(newData);
  }, [data, onChange]);

  return (
    <div className={cn("space-y-6 max-h-[600px] overflow-y-auto", className)}>
      {/* APPLICANT Section */}
      <FormSection title="APPLICANT" defaultExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Full Name <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.applicant.applicant_full_name}
              onChange={(e) => updateField('applicant', 'applicant_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter full name"
              data-testid="input-applicant-full-name"
            />
          </div>

          <DateInput
            label="Date of Birth"
            value={data.applicant.applicant_date_of_birth}
            onChange={(value) => updateField('applicant', 'applicant_date_of_birth', value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Place of Birth <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.applicant.applicant_place_of_birth}
              onChange={(e) => updateField('applicant', 'applicant_place_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of birth"
              data-testid="input-applicant-place-of-birth"
            />
          </div>

          <DateInput
            label="Date of Marriage"
            value={data.applicant.applicant_date_of_marriage}
            onChange={(value) => updateField('applicant', 'applicant_date_of_marriage', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Place of Marriage
            </label>
            <input
              type="text"
              value={data.applicant.applicant_place_of_marriage}
              onChange={(e) => updateField('applicant', 'applicant_place_of_marriage', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of marriage"
              data-testid="input-applicant-place-of-marriage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Spouse Full Name & Maiden Name
            </label>
            <input
              type="text"
              value={data.applicant.applicant_spouse_full_name_and_maiden_name}
              onChange={(e) => updateField('applicant', 'applicant_spouse_full_name_and_maiden_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter spouse name and maiden name"
              data-testid="input-applicant-spouse-name"
            />
          </div>
        </div>

        {/* Minor Children */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-[var(--pc-text-primary)]">Minor Children (0-3)</h5>
            {data.minorChildren.length < 3 && (
              <button
                type="button"
                onClick={addMinorChild}
                className="pc-btn pc-btn--ghost pc-btn--icon text-sm"
                data-testid="button-add-child"
              >
                <Plus className="h-4 w-4" />
                Add Child
              </button>
            )}
          </div>

          {data.minorChildren.map((child, index) => (
            <div key={index} className="border border-[var(--pc-border)] rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h6 className="font-medium text-[var(--pc-text-primary)]">Child {index + 1}</h6>
                <button
                  type="button"
                  onClick={() => removeMinorChild(index)}
                  className="text-[var(--pc-danger)] hover:bg-[var(--pc-danger)] hover:text-white p-1 rounded"
                  data-testid={`button-remove-child-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={child.minor_full_name}
                    onChange={(e) => updateMinorChild(index, 'minor_full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
                    placeholder="Enter child's full name"
                    data-testid={`input-child-${index}-name`}
                  />
                </div>

                <DateInput
                  label="Date of Birth"
                  value={child.minor_date_of_birth}
                  onChange={(value) => updateMinorChild(index, 'minor_date_of_birth', value)}
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={child.minor_place_of_birth}
                    onChange={(e) => updateMinorChild(index, 'minor_place_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
                    placeholder="Enter place of birth"
                    data-testid={`input-child-${index}-place`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {/* POLISH PARENT Section */}
      <FormSection title="POLISH PARENT">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Full Name <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.polishParent.polish_parent_full_name}
              onChange={(e) => updateField('polishParent', 'polish_parent_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter full name"
              data-testid="input-polish-parent-name"
            />
          </div>

          <DateInput
            label="Date of Birth"
            value={data.polishParent.polish_parent_date_of_birth}
            onChange={(value) => updateField('polishParent', 'polish_parent_date_of_birth', value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Place of Birth <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.polishParent.polish_parent_place_of_birth}
              onChange={(e) => updateField('polishParent', 'polish_parent_place_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of birth"
              data-testid="input-polish-parent-place-birth"
            />
          </div>

          <DateInput
            label="Date of Marriage"
            value={data.polishParent.polish_parent_date_of_marriage}
            onChange={(value) => updateField('polishParent', 'polish_parent_date_of_marriage', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Place of Marriage
            </label>
            <input
              type="text"
              value={data.polishParent.polish_parent_place_of_marriage}
              onChange={(e) => updateField('polishParent', 'polish_parent_place_of_marriage', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of marriage"
              data-testid="input-polish-parent-place-marriage"
            />
          </div>

          <DateInput
            label="Date of Emigration"
            value={data.polishParent.polish_parent_date_of_emigration}
            onChange={(value) => updateField('polishParent', 'polish_parent_date_of_emigration', value)}
          />

          <DateInput
            label="Date of Naturalization"
            value={data.polishParent.polish_parent_date_of_naturalization}
            onChange={(value) => updateField('polishParent', 'polish_parent_date_of_naturalization', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Spouse Full Name
            </label>
            <input
              type="text"
              value={data.polishParent.polish_parent_spouse_full_name}
              onChange={(e) => updateField('polishParent', 'polish_parent_spouse_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter spouse name"
              data-testid="input-polish-parent-spouse"
            />
          </div>
        </div>
      </FormSection>

      {/* POLISH GRANDPARENT Section */}
      <FormSection title="POLISH GRANDPARENT">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Full Name <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.polishGrandparent.polish_grandparent_full_name}
              onChange={(e) => updateField('polishGrandparent', 'polish_grandparent_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter full name"
              data-testid="input-polish-grandparent-name"
            />
          </div>

          <DateInput
            label="Date of Birth"
            value={data.polishGrandparent.polish_grandparent_date_of_birth}
            onChange={(value) => updateField('polishGrandparent', 'polish_grandparent_date_of_birth', value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Place of Birth <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.polishGrandparent.polish_grandparent_place_of_birth}
              onChange={(e) => updateField('polishGrandparent', 'polish_grandparent_place_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of birth"
              data-testid="input-polish-grandparent-place-birth"
            />
          </div>

          <DateInput
            label="Date of Marriage"
            value={data.polishGrandparent.polish_grandparent_date_of_mariage}
            onChange={(value) => updateField('polishGrandparent', 'polish_grandparent_date_of_mariage', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Place of Marriage
            </label>
            <input
              type="text"
              value={data.polishGrandparent.polish_grandparent_place_of_mariage}
              onChange={(e) => updateField('polishGrandparent', 'polish_grandparent_place_of_mariage', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of marriage"
              data-testid="input-polish-grandparent-place-marriage"
            />
          </div>

          <DateInput
            label="Date of Emigration"
            value={data.polishGrandparent.polish_grandparent_date_of_emigration}
            onChange={(value) => updateField('polishGrandparent', 'polish_grandparent_date_of_emigration', value)}
          />

          <DateInput
            label="Date of Naturalization"
            value={data.polishGrandparent.polish_grandparent_date_of_naturalization}
            onChange={(value) => updateField('polishGrandparent', 'polish_grandparent_date_of_naturalization', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Spouse Full Name
            </label>
            <input
              type="text"
              value={data.polishGrandparent.polish_grandparent_spouse_full_name}
              onChange={(e) => updateField('polishGrandparent', 'polish_grandparent_spouse_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter spouse name"
              data-testid="input-polish-grandparent-spouse"
            />
          </div>
        </div>
      </FormSection>

      {/* GREAT GRANDPARENTS Section */}
      <FormSection title="GREAT GRANDPARENTS">
        <div className="bg-[var(--pc-panel-elev)] p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--pc-text-primary)]">
            <AlertCircle className="h-4 w-4 text-[var(--pc-warn)]" />
            <span>Great-grandfather (male ancestor) is <strong>REQUIRED</strong> for eligibility</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Great Grandfather Full Name <span className="text-[var(--pc-danger)]">*</span>
            </label>
            <input
              type="text"
              value={data.greatGrandparents.great_grandfather_full_name}
              onChange={(e) => updateField('greatGrandparents', 'great_grandfather_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter great grandfather name"
              data-testid="input-great-grandfather-name"
            />
          </div>

          <DateInput
            label="Great Grandfather Date of Birth"
            value={data.greatGrandparents.great_grandfather_date_of_birth}
            onChange={(value) => updateField('greatGrandparents', 'great_grandfather_date_of_birth', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Great Grandfather Place of Birth
            </label>
            <input
              type="text"
              value={data.greatGrandparents.great_grandfather_place_of_birth}
              onChange={(e) => updateField('greatGrandparents', 'great_grandfather_place_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of birth"
              data-testid="input-great-grandfather-place-birth"
            />
          </div>

          <DateInput
            label="Great Grandfather Date of Marriage"
            value={data.greatGrandparents.great_grandfather_date_of_marriage}
            onChange={(value) => updateField('greatGrandparents', 'great_grandfather_date_of_marriage', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Great Grandfather Place of Marriage
            </label>
            <input
              type="text"
              value={data.greatGrandparents.great_grandfather_place_of_marriage}
              onChange={(e) => updateField('greatGrandparents', 'great_grandfather_place_of_marriage', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter place of marriage"
              data-testid="input-great-grandfather-place-marriage"
            />
          </div>

          <DateInput
            label="Great Grandfather Date of Emigration"
            value={data.greatGrandparents.great_grandfather_date_of_emigartion}
            onChange={(value) => updateField('greatGrandparents', 'great_grandfather_date_of_emigartion', value)}
          />

          <DateInput
            label="Great Grandfather Date of Naturalization"
            value={data.greatGrandparents.great_grandfather_date_of_naturalization}
            onChange={(value) => updateField('greatGrandparents', 'great_grandfather_date_of_naturalization', value)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Great Grandmother Full Name <span className="text-sm text-[var(--pc-text-dim)]">(optional)</span>
            </label>
            <input
              type="text"
              value={data.greatGrandparents.great_grandmother_full_name}
              onChange={(e) => updateField('greatGrandparents', 'great_grandmother_full_name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg bg-[var(--pc-card)] text-[var(--pc-text-primary)] focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="Enter great grandmother name"
              data-testid="input-great-grandmother-name"
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
};