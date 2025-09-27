import React from 'react'
import { Users, User, Edit, Save, X } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { CaseDetails, FamilyTreeData } from '../types'

interface FamilyTreePanelProps {
  caseData: CaseDetails
}

interface FamilyMember {
  label: string
  key: keyof FamilyTreeData
  generation: 'applicant' | 'parents' | 'grandparents'
}

const familyMembers: FamilyMember[] = [
  { label: 'Applicant First Name', key: 'applicant_first_name', generation: 'applicant' },
  { label: 'Applicant Family Name', key: 'applicant_family_name', generation: 'applicant' },
  { label: 'Father First Name', key: 'father_first_name', generation: 'parents' },
  { label: 'Father Last Name', key: 'father_last_name', generation: 'parents' },
  { label: 'Mother First Name', key: 'mother_first_name', generation: 'parents' },
  { label: 'Mother Last Name', key: 'mother_last_name', generation: 'parents' },
  { label: 'Paternal Grandfather First Name', key: 'paternal_grandfather_first_name', generation: 'grandparents' },
  { label: 'Paternal Grandfather Last Name', key: 'paternal_grandfather_last_name', generation: 'grandparents' },
  { label: 'Paternal Grandmother First Name', key: 'paternal_grandmother_first_name', generation: 'grandparents' },
  { label: 'Paternal Grandmother Last Name', key: 'paternal_grandmother_last_name', generation: 'grandparents' },
  { label: 'Maternal Grandfather First Name', key: 'maternal_grandfather_first_name', generation: 'grandparents' },
  { label: 'Maternal Grandfather Last Name', key: 'maternal_grandfather_last_name', generation: 'grandparents' },
  { label: 'Maternal Grandmother First Name', key: 'maternal_grandmother_first_name', generation: 'grandparents' },
  { label: 'Maternal Grandmother Last Name', key: 'maternal_grandmother_last_name', generation: 'grandparents' }
]

export const FamilyTreePanel: React.FC<FamilyTreePanelProps> = ({ caseData }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedData, setEditedData] = React.useState<FamilyTreeData>(caseData.familyTree)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // Here would be the actual save logic
    setIsEditing(false)
    console.log('Saving family tree data:', editedData)
  }

  const handleCancel = () => {
    setEditedData(caseData.familyTree)
    setIsEditing(false)
  }

  const handleInputChange = (key: keyof FamilyTreeData, value: string) => {
    setEditedData(prev => ({ ...prev, [key]: value }))
  }

  const getGenerationData = (generation: 'applicant' | 'parents' | 'grandparents') => {
    return familyMembers.filter(member => member.generation === generation)
  }

  const getCompletionRate = () => {
    const filledFields = familyMembers.filter(member => editedData[member.key]).length
    return Math.round((filledFields / familyMembers.length) * 100)
  }

  const renderFamilySection = (title: string, members: FamilyMember[], bgColor: string) => (
    <Card>
      <CardHeader className={`${bgColor} text-white`}>
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => (
            <div key={member.key}>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                {member.label}
              </label>
              {isEditing ? (
                <Input
                  value={editedData[member.key] || ''}
                  onChange={(e) => handleInputChange(member.key, e.target.value.toUpperCase())}
                  placeholder={`Enter ${member.label.toLowerCase()}`}
                  className="w-full"
                />
              ) : (
                <div className="h-10 px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg)] flex items-center">
                  <span className="text-[var(--text)]">
                    {editedData[member.key] || <span className="text-[var(--muted)]">Not provided</span>}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Family Tree Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h3 className="font-semibold">Family Tree</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">
                {getCompletionRate()}% Complete
              </span>
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardBody>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-gradient-to-r from-[var(--accent)] to-[var(--success)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionRate()}%` }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Applicant Section */}
      {renderFamilySection('Applicant', getGenerationData('applicant'), 'bg-blue-600')}

      {/* Parents Section */}
      {renderFamilySection('Parents', getGenerationData('parents'), 'bg-green-600')}

      {/* Grandparents Section */}
      {renderFamilySection('Grandparents', getGenerationData('grandparents'), 'bg-purple-600')}

      {/* Family Tree Visualization */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Family Tree Visualization</h3>
        </CardHeader>
        <CardBody>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-[var(--radius)]">
            <div className="text-center space-y-6">
              {/* Grandparents Level */}
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                  <User className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="font-medium truncate">
                    {editedData.paternal_grandfather_first_name || 'P. Grandfather'}
                  </p>
                  <p className="text-[var(--muted)] truncate">
                    {editedData.paternal_grandfather_last_name || 'Surname'}
                  </p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                  <User className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="font-medium truncate">
                    {editedData.paternal_grandmother_first_name || 'P. Grandmother'}
                  </p>
                  <p className="text-[var(--muted)] truncate">
                    {editedData.paternal_grandmother_last_name || 'Surname'}
                  </p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                  <User className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="font-medium truncate">
                    {editedData.maternal_grandfather_first_name || 'M. Grandfather'}
                  </p>
                  <p className="text-[var(--muted)] truncate">
                    {editedData.maternal_grandfather_last_name || 'Surname'}
                  </p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                  <User className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="font-medium truncate">
                    {editedData.maternal_grandmother_first_name || 'M. Grandmother'}
                  </p>
                  <p className="text-[var(--muted)] truncate">
                    {editedData.maternal_grandmother_last_name || 'Surname'}
                  </p>
                </div>
              </div>

              {/* Connection Lines */}
              <div className="h-8 flex items-center justify-center">
                <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Parents Level */}
              <div className="grid grid-cols-2 gap-8">
                <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <User className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">
                    {editedData.father_first_name || 'Father'}
                  </p>
                  <p className="text-[var(--muted)] text-sm">
                    {editedData.father_last_name || 'Surname'}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <User className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">
                    {editedData.mother_first_name || 'Mother'}
                  </p>
                  <p className="text-[var(--muted)] text-sm">
                    {editedData.mother_last_name || 'Surname'}
                  </p>
                </div>
              </div>

              {/* Connection Lines */}
              <div className="h-8 flex items-center justify-center">
                <div className="w-32 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Applicant Level */}
              <div className="flex justify-center">
                <div className="p-4 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-bold text-lg">
                    {editedData.applicant_first_name || 'Applicant'}
                  </p>
                  <p className="text-[var(--muted)]">
                    {editedData.applicant_family_name || 'Family Name'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}