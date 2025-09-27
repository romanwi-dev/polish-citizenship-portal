import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientDetailsData {
  firstNames: string;
  lastName: string;
  maidenName: string;
  passportNumber: string;
  spouseFullName: string;
  spousePassportNumber: string;
  birthDate: string;
  birthPlace: string;
  dateOfMarriage: string;
  placeOfMarriage: string;
  mobilePhone: string;
  email: string;
  currentAddress: string;
  gender: string;
  maritalStatus: string;
  foreignCitizenshipsWithDates: string;
}

interface ApplicantDetailsSectionProps {
  clientData: ClientDetailsData | null;
  setClientData: (data: ClientDetailsData | null) => void;
  confirmSpelling: boolean;
  confirmDates: boolean;
  confirmAddress: boolean;
  setConfirmSpelling: (value: boolean) => void;
  setConfirmDates: (value: boolean) => void;
  setConfirmAddress: (value: boolean) => void;
  fieldErrors: {[key: string]: boolean};
  setFieldErrors: (errors: {[key: string]: boolean}) => void;
  formatDateInput: (input: string) => string;
  formatPlaceInput: (input: string) => string;
  formatPhoneNumber: (input: string) => string;
}

export const ApplicantDetailsSection: React.FC<ApplicantDetailsSectionProps> = React.memo(({
  clientData,
  setClientData,
  confirmSpelling,
  confirmDates,
  confirmAddress,
  setConfirmSpelling,
  setConfirmDates,
  setConfirmAddress,
  fieldErrors,
  setFieldErrors,
  formatDateInput,
  formatPlaceInput,
  formatPhoneNumber
}) => {
  const surnameInputRef = useRef<HTMLInputElement>(null);
  const givenNamesInputRef = useRef<HTMLInputElement>(null);
  const maidenNameInputRef = useRef<HTMLInputElement>(null);

  const updateClientData = (field: keyof ClientDetailsData, value: string) => {
    if (!clientData) return;
    
    setClientData({
      ...clientData,
      [field]: value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors({
        ...fieldErrors,
        [field]: false
      });
    }
  };

  if (!clientData) return null;

  return (
    <Card className="glass-card-success border-green-200 shadow-lg">
      <CardHeader className="glass-header-success pb-6" data-section="1">
        <CardTitle className="text-2xl font-bold text-green-700 text-center flex items-center justify-center gap-3">
          <span className="text-3xl">📝</span>
          <span>Section 1: Applicant Details</span>
        </CardTitle>
        <p className="text-green-600 text-center mt-2 text-lg">
          Personal information and contact details
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="glass-section-success p-4 lg:p-6 rounded-xl">
          <div className="space-y-6">
            {/* Full Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstNames" className="text-lg font-semibold text-gray-700">
                  Given Names *
                </Label>
                <Input
                  ref={givenNamesInputRef}
                  id="firstNames"
                  className={`h-12 text-lg font-semibold ${fieldErrors.firstNames ? 'border-red-500' : ''}`}
                  placeholder="Enter your given names"
                  value={clientData.firstNames}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    updateClientData('firstNames', value);
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-lg font-semibold text-gray-700">
                  Surname *
                </Label>
                <Input
                  ref={surnameInputRef}
                  id="lastName"
                  className={`h-12 text-lg font-semibold ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Enter your surname"
                  value={clientData.lastName}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    updateClientData('lastName', value);
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Maiden Name */}
            <div className="space-y-2">
              <Label htmlFor="maidenName" className="text-lg font-semibold text-gray-700">
                Maiden Name (if applicable)
              </Label>
              <Input
                ref={maidenNameInputRef}
                id="maidenName"
                className="h-12 text-lg font-semibold"
                placeholder="Enter maiden name if different from surname"
                value={clientData.maidenName}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  updateClientData('maidenName', value);
                }}
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Birth Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-lg font-semibold text-gray-700">
                  Date of Birth *
                </Label>
                <Input
                  id="birthDate"
                  className={`h-12 text-lg font-semibold ${fieldErrors.birthDate ? 'border-red-500' : ''}`}
                  placeholder="DD.MM.YYYY"
                  value={clientData.birthDate}
                  onChange={(e) => {
                    const formatted = formatDateInput(e.target.value);
                    updateClientData('birthDate', formatted);
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthPlace" className="text-lg font-semibold text-gray-700">
                  Place of Birth *
                </Label>
                <Input
                  id="birthPlace"
                  className={`h-12 text-lg font-semibold ${fieldErrors.birthPlace ? 'border-red-500' : ''}`}
                  placeholder="City, Country"
                  value={clientData.birthPlace}
                  onChange={(e) => {
                    const formatted = formatPlaceInput(e.target.value);
                    updateClientData('birthPlace', formatted);
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-semibold text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  className={`h-12 text-lg font-semibold ${fieldErrors.email ? 'border-red-500' : ''}`}
                  placeholder="your.email@example.com"
                  value={clientData.email}
                  onChange={(e) => updateClientData('email', e.target.value)}
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobilePhone" className="text-lg font-semibold text-gray-700">
                  Mobile Phone *
                </Label>
                <Input
                  id="mobilePhone"
                  className={`h-12 text-lg font-semibold ${fieldErrors.mobilePhone ? 'border-red-500' : ''}`}
                  placeholder="+48 509 865 011"
                  value={clientData.mobilePhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updateClientData('mobilePhone', formatted);
                  }}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Confirmation Checkboxes */}
            <div className="mt-8 space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Please confirm the following:</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 text-base">
                  <input
                    type="checkbox"
                    checked={confirmSpelling}
                    onChange={(e) => setConfirmSpelling(e.target.checked)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span>I confirm all names and spelling are correct</span>
                </label>
                
                <label className="flex items-center space-x-3 text-base">
                  <input
                    type="checkbox"
                    checked={confirmDates}
                    onChange={(e) => setConfirmDates(e.target.checked)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span>I confirm all dates are accurate</span>
                </label>
                
                <label className="flex items-center space-x-3 text-base">
                  <input
                    type="checkbox"
                    checked={confirmAddress}
                    onChange={(e) => setConfirmAddress(e.target.checked)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span>I confirm contact information is current</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});