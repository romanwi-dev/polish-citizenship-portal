import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PerformanceWrapper } from "@/components/performance-wrapper";

interface FamilyTreeData {
  // Applicant Data
  applicantFirstNames?: string;
  applicantLastName?: string;
  applicantMaidenName?: string;
  applicantDateOfBirth?: string;
  applicantPlaceOfBirth?: string;
  applicantGender?: string;
  applicantMarried?: string;
  applicantDateOfMarriage?: string;
  applicantPlaceOfMarriage?: string;
  applicantSpouseFirstNames?: string;
  applicantSpouseLastName?: string;

  // Polish Parent Data
  polishParentFirstNames?: string;
  polishParentLastName?: string;
  polishParentMaidenName?: string;
  polishParentDateOfBirth?: string;
  polishParentPlaceOfBirth?: string;
  polishParentGender?: string;
  polishParentDateOfDeath?: string;
  polishParentPlaceOfDeath?: string;
  polishParentDateOfMarriage?: string;
  polishParentPlaceOfMarriage?: string;
  polishParentSpouseFirstNames?: string;
  polishParentSpouseLastName?: string;

  // Polish Grandparents Data
  polishGrandfatherFirstNames?: string;
  polishGrandfatherLastName?: string;
  polishGrandfatherDateOfBirth?: string;
  polishGrandfatherPlaceOfBirth?: string;
  polishGrandfatherDateOfDeath?: string;
  polishGrandfatherPlaceOfDeath?: string;
  polishGrandmotherFirstNames?: string;
  polishGrandmotherLastName?: string;
  polishGrandmotherMaidenName?: string;
  polishGrandmotherDateOfBirth?: string;
  polishGrandmotherPlaceOfBirth?: string;
  polishGrandmotherDateOfDeath?: string;
  polishGrandmotherPlaceOfDeath?: string;
  polishGrandparentsDateOfMarriage?: string;
  polishGrandparentsPlaceOfMarriage?: string;

  // Great Grandparents Data
  greatGrandfatherName?: string;
  greatGrandfatherBirthDate?: string;
  greatGrandfatherBirthPlace?: string;
  greatGrandfatherEmigrationDate?: string;
  greatGrandfatherNaturalizationDate?: string;
  greatGrandmotherName?: string;
  greatGrandmotherBirthDate?: string;
  greatGrandmotherBirthPlace?: string;
  greatGrandmotherMaidenName?: string;
  greatGrandparentsMarriageDate?: string;
  greatGrandparentsMarriagePlace?: string;
}

interface FamilyTreeSectionProps {
  familyTreeData: Partial<FamilyTreeData>;
  setFamilyTreeData: (data: Partial<FamilyTreeData>) => void;
  confirmFamilySpelling: boolean;
  confirmFamilyDates: boolean;
  confirmPolishAncestor: boolean;
  confirmGenerationOrder: boolean;
  setConfirmFamilySpelling: (value: boolean) => void;
  setConfirmFamilyDates: (value: boolean) => void;
  setConfirmPolishAncestor: (value: boolean) => void;
  setConfirmGenerationOrder: (value: boolean) => void;
  formatDateInput: (input: string) => string;
  formatPlaceInput: (input: string) => string;
}

const FamilyGenerationCard: React.FC<{
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}> = React.memo(({ title, icon, color, children }) => (
  <div className={`${color} p-6 rounded-xl shadow-lg border-2`}>
    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
));

export const FamilyTreeSection: React.FC<FamilyTreeSectionProps> = React.memo(({
  familyTreeData,
  setFamilyTreeData,
  confirmFamilySpelling,
  confirmFamilyDates,
  confirmPolishAncestor,
  confirmGenerationOrder,
  setConfirmFamilySpelling,
  setConfirmFamilyDates,
  setConfirmPolishAncestor,
  setConfirmGenerationOrder,
  formatDateInput,
  formatPlaceInput
}) => {
  const updateFamilyTreeData = (field: keyof FamilyTreeData, value: string) => {
    setFamilyTreeData({
      ...familyTreeData,
      [field]: value
    });
  };

  return (
    <Card className="glass-card-info border-blue-200 shadow-lg">
      <CardHeader className="glass-header-info pb-6">
        <CardTitle className="text-2xl font-bold text-blue-700 text-center flex items-center justify-center gap-3">
          <span className="text-3xl">🌳</span>
          <span>Section 2: Family Tree</span>
        </CardTitle>
        <p className="text-blue-600 text-center mt-2 text-lg">
          Polish ancestry and genealogical information
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-8 p-4 lg:p-6">
          
          {/* Applicant Information */}
          <PerformanceWrapper fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-xl"></div>}>
            <FamilyGenerationCard 
              title="Applicant (You)" 
              icon="👤" 
              color="bg-green-50 border-green-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">First Names</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.applicantFirstNames || ''}
                    onChange={(e) => updateFamilyTreeData('applicantFirstNames', e.target.value.toUpperCase())}
                    placeholder="Given names"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Last Name</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.applicantLastName || ''}
                    onChange={(e) => updateFamilyTreeData('applicantLastName', e.target.value.toUpperCase())}
                    placeholder="Surname"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date of Birth</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.applicantDateOfBirth || ''}
                    onChange={(e) => updateFamilyTreeData('applicantDateOfBirth', formatDateInput(e.target.value))}
                    placeholder="DD.MM.YYYY"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Place of Birth</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.applicantPlaceOfBirth || ''}
                    onChange={(e) => updateFamilyTreeData('applicantPlaceOfBirth', formatPlaceInput(e.target.value))}
                    placeholder="City, Country"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </FamilyGenerationCard>
          </PerformanceWrapper>

          {/* Polish Parent */}
          <PerformanceWrapper fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-xl"></div>}>
            <FamilyGenerationCard 
              title="Polish Parent" 
              icon="🇵🇱" 
              color="bg-red-50 border-red-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">First Names *</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.polishParentFirstNames || ''}
                    onChange={(e) => updateFamilyTreeData('polishParentFirstNames', e.target.value.toUpperCase())}
                    placeholder="Given names"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Last Name *</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.polishParentLastName || ''}
                    onChange={(e) => updateFamilyTreeData('polishParentLastName', e.target.value.toUpperCase())}
                    placeholder="Surname"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date of Birth *</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.polishParentDateOfBirth || ''}
                    onChange={(e) => updateFamilyTreeData('polishParentDateOfBirth', formatDateInput(e.target.value))}
                    placeholder="DD.MM.YYYY"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Place of Birth *</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.polishParentPlaceOfBirth || ''}
                    onChange={(e) => updateFamilyTreeData('polishParentPlaceOfBirth', formatPlaceInput(e.target.value))}
                    placeholder="City, Poland"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date of Death</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.polishParentDateOfDeath || ''}
                    onChange={(e) => updateFamilyTreeData('polishParentDateOfDeath', formatDateInput(e.target.value))}
                    placeholder="DD.MM.YYYY (if applicable)"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Place of Death</Label>
                  <Input
                    className="h-10 text-sm font-semibold"
                    value={familyTreeData.polishParentPlaceOfDeath || ''}
                    onChange={(e) => updateFamilyTreeData('polishParentPlaceOfDeath', formatPlaceInput(e.target.value))}
                    placeholder="City, Country (if applicable)"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </FamilyGenerationCard>
          </PerformanceWrapper>

          {/* Polish Grandparents */}
          <PerformanceWrapper fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>}>
            <FamilyGenerationCard 
              title="Polish Grandparents" 
              icon="👴👵" 
              color="bg-yellow-50 border-yellow-200"
            >
              <div className="space-y-6">
                {/* Grandfather */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Polish Grandfather</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">First Names *</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandfatherFirstNames || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandfatherFirstNames', e.target.value.toUpperCase())}
                        placeholder="Given names"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Last Name *</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandfatherLastName || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandfatherLastName', e.target.value.toUpperCase())}
                        placeholder="Surname"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Date of Birth</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandfatherDateOfBirth || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandfatherDateOfBirth', formatDateInput(e.target.value))}
                        placeholder="DD.MM.YYYY"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Place of Birth</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandfatherPlaceOfBirth || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandfatherPlaceOfBirth', formatPlaceInput(e.target.value))}
                        placeholder="City, Poland"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Grandmother */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Polish Grandmother</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">First Names *</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandmotherFirstNames || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandmotherFirstNames', e.target.value.toUpperCase())}
                        placeholder="Given names"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Maiden Name *</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandmotherMaidenName || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandmotherMaidenName', e.target.value.toUpperCase())}
                        placeholder="Maiden surname"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Date of Birth</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandmotherDateOfBirth || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandmotherDateOfBirth', formatDateInput(e.target.value))}
                        placeholder="DD.MM.YYYY"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Place of Birth</Label>
                      <Input
                        className="h-10 text-sm font-semibold"
                        value={familyTreeData.polishGrandmotherPlaceOfBirth || ''}
                        onChange={(e) => updateFamilyTreeData('polishGrandmotherPlaceOfBirth', formatPlaceInput(e.target.value))}
                        placeholder="City, Poland"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FamilyGenerationCard>
          </PerformanceWrapper>

          {/* Family Tree Confirmations */}
          <div className="mt-8 space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Family Tree Confirmations:</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 text-base">
                <input
                  type="checkbox"
                  checked={confirmFamilySpelling}
                  onChange={(e) => setConfirmFamilySpelling(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span>I confirm all family names and spelling are correct</span>
              </label>
              
              <label className="flex items-center space-x-3 text-base">
                <input
                  type="checkbox"
                  checked={confirmFamilyDates}
                  onChange={(e) => setConfirmFamilyDates(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span>I confirm all family dates are accurate</span>
              </label>
              
              <label className="flex items-center space-x-3 text-base">
                <input
                  type="checkbox"
                  checked={confirmPolishAncestor}
                  onChange={(e) => setConfirmPolishAncestor(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span>I confirm the Polish ancestry line is accurate</span>
              </label>
              
              <label className="flex items-center space-x-3 text-base">
                <input
                  type="checkbox"
                  checked={confirmGenerationOrder}
                  onChange={(e) => setConfirmGenerationOrder(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span>I confirm the generation order is correct</span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});