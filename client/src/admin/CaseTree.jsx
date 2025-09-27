import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  FileText, 
  Users, 
  Download,
  Plus,
  User,
  Calendar,
  MapPin,
  Loader2,
  Upload,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Crown,
  Edit3,
  ClipboardCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { hacSubmit, HAC_TYPES } from '@/lib/hac';
import { Link } from 'wouter';

export default function CaseTree({ caseId }) {
  const [editMode, setEditMode] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [lineageString, setLineageString] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCsvFile, setSelectedCsvFile] = useState(null);
  const [editingPersons, setEditingPersons] = useState({}); // Track which persons are being edited
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch tree data
  const { data: treeResponse, isLoading: treeLoading, error: treeError } = useQuery({
    queryKey: ['case-tree', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/tree`);
      if (!response.ok) {
        throw new Error('Failed to fetch tree data');
      }
      return response.json();
    },
    enabled: !!caseId
  });

  // Fetch sources data
  const { data: sourcesResponse, isLoading: sourcesLoading } = useQuery({
    queryKey: ['case-tree-sources', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/tree/sources`);
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      return response.json();
    },
    enabled: !!caseId
  });

  // Fetch import status
  const { data: importStatusResponse } = useQuery({
    queryKey: ['case-tree-import-status', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/tree/import-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch import status');
      }
      return response.json();
    },
    enabled: !!caseId
  });

  // Update local state when tree data loads
  useEffect(() => {
    if (treeResponse?.success && treeResponse.tree) {
      setTreeData(treeResponse.tree);
      setLineageString(treeResponse.tree.lineage || '');
      setEditingPersons({}); // Clear any editing states when tree changes
    }
  }, [treeResponse]);

  // Save person mutation
  const savePersonMutation = useMutation({
    mutationFn: async ({ personId, personData }) => {
      return await hacSubmit(caseId, HAC_TYPES.TREE_PATCH, { 
        action: "updatePerson", 
        personId, 
        personData 
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Sent to HAC for approval",
        description: "Sent to HAC for approval.",
      });
      // Stop editing this person
      setEditingPersons(prev => {
        const newState = { ...prev };
        delete newState[variables.personId];
        return newState;
      });
    },
    onError: (error) => {
      toast({
        title: "Submit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete person mutation
  const deletePersonMutation = useMutation({
    mutationFn: async (personId) => {
      return await hacSubmit(caseId, HAC_TYPES.TREE_PATCH, { action: "delete", personId: personId });
    },
    onSuccess: (data) => {
      toast({
        title: "Sent to HAC for approval",
        description: "Sent to HAC for approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set proband mutation
  const setProbandMutation = useMutation({
    mutationFn: async (probandId) => {
      return await hacSubmit(caseId, HAC_TYPES.TREE_PATCH, { action: "setProband", probandId: probandId });
    },
    onSuccess: (data) => {
      toast({
        title: "Sent to HAC for approval",
        description: "Sent to HAC for approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save tree mutation (legacy for lineage)
  const saveTreeMutation = useMutation({
    mutationFn: async (updatedTree) => {
      return await hacSubmit(caseId, HAC_TYPES.TREE_PATCH, { action: "saveTree", tree: updatedTree });
    },
    onSuccess: (data) => {
      toast({
        title: "Sent to HAC for approval",
        description: "Sent to HAC for approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save to case mutation (for lineage)
  const saveToCaseMutation = useMutation({
    mutationFn: async (lineage) => {
      return await hacSubmit(caseId, HAC_TYPES.CASE_PATCH, { lineage: lineage });
    },
    onSuccess: () => {
      toast({
        title: "Sent to HAC for approval",
        description: "Sent to HAC for approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // GEDCOM import mutation - NOTE: Direct import bypasses HAC as bulk import operations
  // are considered administrative tasks that don't require individual approval  
  const importGedcomMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('gedcomFile', file);

      const response = await fetch(`/api/cases/${caseId}/tree/import-gedcom`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import GEDCOM file');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "GEDCOM Imported Successfully",
        description: `Imported ${data.stats.totalPersons} persons and ${data.stats.totalRelationships} relationships.`,
      });
      
      // Clear the selected file
      setSelectedFile(null);
      
      // Refetch all tree-related data
      queryClient.invalidateQueries(['case-tree', caseId]);
      queryClient.invalidateQueries(['case-tree-sources', caseId]);
      queryClient.invalidateQueries(['case-tree-import-status', caseId]);
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // CSV import mutation - NOTE: Direct import bypasses HAC as bulk import operations
  // are considered administrative tasks that don't require individual approval
  const importCsvMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch(`/api/cases/${caseId}/tree/import-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import CSV file');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "CSV Imported Successfully",
        description: `Imported ${data.stats.importedPersons} persons (${data.stats.newPersons} new).`,
      });
      
      // Clear the selected CSV file
      setSelectedCsvFile(null);
      
      // Refetch all tree-related data
      queryClient.invalidateQueries(['case-tree', caseId]);
      queryClient.invalidateQueries(['case-tree-sources', caseId]);
      queryClient.invalidateQueries(['case-tree-import-status', caseId]);
    },
    onError: (error) => {
      toast({
        title: "CSV Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to create new empty person
  const createEmptyPerson = () => ({
    given: '',
    surname: '',
    sex: 'Unknown',
    born: { date: '', place: '' },
    died: { date: '', place: '' },
    parents: []
  });

  // Helper function to get available parents (excluding self)
  const getAvailableParents = (currentPersonId) => {
    if (!treeData?.persons) return [];
    return treeData.persons.filter(p => p.id !== currentPersonId);
  };

  // Helper function to get person display name
  const getPersonDisplayName = (person) => {
    if (!person) return 'Unknown';
    const name = `${person.given || ''} ${person.surname || ''}`.trim();
    return name || 'Unnamed';
  };

  // Handler functions
  const handleSaveToCase = () => {
    saveToCaseMutation.mutate(lineageString);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importGedcomMutation.mutate(selectedFile);
    }
  };

  const handleCsvFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedCsvFile(file);
    }
  };

  const handleImportCsv = () => {
    if (selectedCsvFile) {
      importCsvMutation.mutate(selectedCsvFile);
    }
  };

  const handleExportCsv = () => {
    // Direct link download
    const link = document.createElement('a');
    link.href = `/api/cases/${caseId}/tree.csv`;
    link.download = `family_tree_${caseId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Export",
      description: "Downloading family tree CSV file.",
    });
  };

  const handleAddPerson = () => {
    const newPersonId = `new_${Date.now()}`;
    const newPerson = createEmptyPerson();
    
    // Add to editing state
    setEditingPersons(prev => ({
      ...prev,
      [newPersonId]: { ...newPerson, isNew: true }
    }));
  };

  const handleEditPerson = (personId) => {
    const person = treeData.persons.find(p => p.id === personId);
    if (person) {
      setEditingPersons(prev => ({
        ...prev,
        [personId]: { ...person, isNew: false }
      }));
    }
  };

  const handleCancelEdit = (personId) => {
    setEditingPersons(prev => {
      const newState = { ...prev };
      delete newState[personId];
      return newState;
    });
  };

  const handleUpdateEditingPerson = (personId, field, value) => {
    setEditingPersons(prev => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        [field]: value
      }
    }));
  };

  const handleUpdateNestedField = (personId, parentField, childField, value) => {
    setEditingPersons(prev => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        [parentField]: {
          ...prev[personId][parentField],
          [childField]: value
        }
      }
    }));
  };

  const handleSavePerson = (personId) => {
    const editingPerson = editingPersons[personId];
    if (!editingPerson) return;

    // Validate required fields
    if (!editingPerson.given.trim() || !editingPerson.surname.trim()) {
      toast({
        title: "Validation Error",
        description: "Given name and surname are required.",
        variant: "destructive",
      });
      return;
    }

    const personData = {
      personId: editingPerson.isNew ? undefined : personId,
      given: editingPerson.given.trim(),
      surname: editingPerson.surname.trim(),
      sex: editingPerson.sex,
      born: editingPerson.born,
      died: editingPerson.died,
      parents: editingPerson.parents
    };

    savePersonMutation.mutate({ personId, personData });
  };

  const handleDeletePerson = (personId) => {
    deletePersonMutation.mutate(personId);
  };

  const handleSetProband = (personId) => {
    setProbandMutation.mutate(personId);
  };

  const generateLineageString = () => {
    if (!treeData?.persons) return '';
    
    // Find proband and generate lineage
    const proband = treeData.persons.find(p => p.id === treeData.proband);
    if (!proband) return '';
    
    const lineage = getPersonDisplayName(proband) + ' (Proband)';
    setLineageString(lineage);
  };

  if (treeLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading family tree...</span>
      </div>
    );
  }

  if (treeError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading family tree: {treeError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="case-tree">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Family Tree</h2>
          <p className="text-muted-foreground">Case #{caseId}</p>
          {treeData?.proband && (
            <p className="text-sm text-blue-600">
              Proband: {getPersonDisplayName(treeData.persons.find(p => p.id === treeData.proband))}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            data-testid="button-hac-board"
          >
            <Link href="/admin/hac">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              HAC Board
            </Link>
          </Button>
          <Button
            variant={editMode ? "secondary" : "default"}
            onClick={() => setEditMode(!editMode)}
            data-testid="button-toggle-edit"
          >
            {editMode ? "View Mode" : "Edit Mode"}
          </Button>
        </div>
      </div>

      {/* GEDCOM Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            GEDCOM Import
          </CardTitle>
          <CardDescription>
            Import family tree data from a GEDCOM (.ged) file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Status */}
          {importStatusResponse?.success && importStatusResponse.isImported && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Tree imported from GEDCOM ({importStatusResponse.totalPersons} persons)
              </span>
            </div>
          )}
          
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="gedcom-file">Select GEDCOM File</Label>
            <Input
              id="gedcom-file"
              type="file"
              accept=".ged,.gedcom,.txt"
              onChange={handleFileSelect}
              data-testid="input-gedcom-file"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>
          
          {/* Import Button */}
          <Button 
            onClick={handleImport}
            disabled={!selectedFile || importGedcomMutation.isPending}
            data-testid="button-import-gedcom"
          >
            {importGedcomMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {importGedcomMutation.isPending ? 'Importing...' : 'Import GEDCOM'}
          </Button>
          
          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Important:</p>
              <p>Importing will replace any existing family tree data for this case.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Import/Export
          </CardTitle>
          <CardDescription>
            Import or export family tree data as CSV (id, given, surname, sex, bornDate, bornPlace, parent1, parent2)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSV Export */}
            <div className="space-y-2">
              <Label>Export CSV</Label>
              <Button 
                onClick={handleExportCsv}
                variant="outline"
                className="w-full"
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>

            {/* CSV Import */}
            <div className="space-y-2">
              <Label htmlFor="csv-file">Import CSV</Label>
              <div className="space-y-2">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileSelect}
                  data-testid="input-csv-file"
                />
                {selectedCsvFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedCsvFile.name} ({Math.round(selectedCsvFile.size / 1024)} KB)
                  </p>
                )}
                <Button 
                  onClick={handleImportCsv}
                  disabled={!selectedCsvFile || importCsvMutation.isPending}
                  className="w-full"
                  data-testid="button-import-csv"
                >
                  {importCsvMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Upload className="h-4 w-4 mr-2" />
                  {importCsvMutation.isPending ? 'Importing...' : 'Import CSV'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* CSV Format Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">CSV Format:</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
              id,given,surname,sex,bornDate,bornPlace,parent1,parent2
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lineage String */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lineage String
          </CardTitle>
          <CardDescription>
            Generated lineage path for this case
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editMode ? (
            <Textarea
              value={lineageString}
              onChange={(e) => setLineageString(e.target.value)}
              placeholder="Enter lineage string..."
              rows={3}
              data-testid="textarea-lineage"
            />
          ) : (
            <div className="p-3 bg-muted rounded-md min-h-[80px]">
              {lineageString || <span className="text-muted-foreground">No lineage defined</span>}
            </div>
          )}
          
          <div className="flex gap-2">
            {editMode && (
              <Button 
                variant="outline" 
                onClick={generateLineageString}
                data-testid="button-generate-lineage"
              >
                Generate from Tree
              </Button>
            )}
            <Button 
              onClick={handleSaveToCase}
              disabled={saveToCaseMutation.isPending || !lineageString.trim()}
              data-testid="button-save-to-case"
            >
              {saveToCaseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save to Case
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Family Members
              </CardTitle>
              <CardDescription>
                Manage persons in the family tree
              </CardDescription>
            </div>
            {editMode && (
              <Button 
                variant="outline" 
                onClick={handleAddPerson}
                data-testid="button-add-person"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Existing persons */}
          {treeData?.persons && treeData.persons.length > 0 && (
            <div className="space-y-4 mb-6">
              {treeData.persons.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  isProband={treeData.proband === person.id}
                  isEditing={!!editingPersons[person.id]}
                  editingData={editingPersons[person.id]}
                  editMode={editMode}
                  availableParents={getAvailableParents(person.id)}
                  onEdit={() => handleEditPerson(person.id)}
                  onCancel={() => handleCancelEdit(person.id)}
                  onSave={() => handleSavePerson(person.id)}
                  onDelete={() => handleDeletePerson(person.id)}
                  onSetProband={() => handleSetProband(person.id)}
                  onUpdateField={(field, value) => handleUpdateEditingPerson(person.id, field, value)}
                  onUpdateNestedField={(parentField, childField, value) => 
                    handleUpdateNestedField(person.id, parentField, childField, value)
                  }
                  mutations={{
                    save: savePersonMutation,
                    delete: deletePersonMutation,
                    setProband: setProbandMutation
                  }}
                />
              ))}
            </div>
          )}

          {/* New persons being added */}
          {Object.entries(editingPersons).filter(([id, data]) => data.isNew).map(([personId, editingData]) => (
            <PersonCard
              key={personId}
              person={null}
              isProband={false}
              isEditing={true}
              editingData={editingData}
              editMode={true}
              availableParents={getAvailableParents(personId)}
              onCancel={() => handleCancelEdit(personId)}
              onSave={() => handleSavePerson(personId)}
              onUpdateField={(field, value) => handleUpdateEditingPerson(personId, field, value)}
              onUpdateNestedField={(parentField, childField, value) => 
                handleUpdateNestedField(personId, parentField, childField, value)
              }
              mutations={{
                save: savePersonMutation,
                delete: deletePersonMutation,
                setProband: setProbandMutation
              }}
            />
          ))}

          {/* Empty state */}
          {(!treeData?.persons || treeData.persons.length === 0) && Object.keys(editingPersons).length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No family members added yet. Click "Add Person" to start building the tree.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Source Documents
          </CardTitle>
          <CardDescription>
            Supporting documents for family tree research
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading sources...
            </div>
          ) : sourcesResponse?.sources && sourcesResponse.sources.length > 0 ? (
            <div className="space-y-2">
              {sourcesResponse.sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`source-file-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.type.toUpperCase()} • {(source.size / 1024).toFixed(1)} KB • 
                        Modified {new Date(source.modified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-download-${index}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No source documents found for this case.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Person Card Component
function PersonCard({ 
  person, 
  isProband, 
  isEditing, 
  editingData, 
  editMode, 
  availableParents = [],
  onEdit, 
  onCancel, 
  onSave, 
  onDelete, 
  onSetProband,
  onUpdateField,
  onUpdateNestedField,
  mutations 
}) {
  const isNew = !person;
  const displayData = isEditing ? editingData : person;

  if (!displayData) return null;

  const getPersonDisplayName = (person) => {
    if (!person) return 'Unknown';
    const name = `${person.given || ''} ${person.surname || ''}`.trim();
    return name || 'Unnamed';
  };

  return (
    <div 
      className={`p-4 border rounded-lg space-y-4 ${isProband ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}
      data-testid={`person-card-${person?.id || 'new'}`}
    >
      {/* Header with proband indicator */}
      {isProband && (
        <div className="flex items-center gap-2 text-blue-600">
          <Crown className="h-4 w-4" />
          <span className="text-sm font-medium">Proband</span>
        </div>
      )}

      {isEditing ? (
        <>
          {/* Editing Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Given Name */}
            <div>
              <Label htmlFor={`given-${person?.id || 'new'}`}>Given Name *</Label>
              <Input
                id={`given-${person?.id || 'new'}`}
                value={editingData.given || ''}
                onChange={(e) => onUpdateField('given', e.target.value)}
                placeholder="First name"
                data-testid={`input-given-${person?.id || 'new'}`}
              />
            </div>

            {/* Surname */}
            <div>
              <Label htmlFor={`surname-${person?.id || 'new'}`}>Surname *</Label>
              <Input
                id={`surname-${person?.id || 'new'}`}
                value={editingData.surname || ''}
                onChange={(e) => onUpdateField('surname', e.target.value)}
                placeholder="Last name"
                data-testid={`input-surname-${person?.id || 'new'}`}
              />
            </div>

            {/* Sex */}
            <div>
              <Label htmlFor={`sex-${person?.id || 'new'}`}>Sex</Label>
              <Select
                value={editingData.sex || 'Unknown'}
                onValueChange={(value) => onUpdateField('sex', value)}
              >
                <SelectTrigger data-testid={`select-sex-${person?.id || 'new'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Born Date */}
            <div>
              <Label htmlFor={`born-date-${person?.id || 'new'}`}>Born Date</Label>
              <Input
                id={`born-date-${person?.id || 'new'}`}
                value={editingData.born?.date || ''}
                onChange={(e) => onUpdateNestedField('born', 'date', e.target.value)}
                placeholder="e.g. 1920-05-15"
                data-testid={`input-born-date-${person?.id || 'new'}`}
              />
            </div>

            {/* Born Place */}
            <div>
              <Label htmlFor={`born-place-${person?.id || 'new'}`}>Born Place</Label>
              <Input
                id={`born-place-${person?.id || 'new'}`}
                value={editingData.born?.place || ''}
                onChange={(e) => onUpdateNestedField('born', 'place', e.target.value)}
                placeholder="e.g. Warsaw, Poland"
                data-testid={`input-born-place-${person?.id || 'new'}`}
              />
            </div>

            {/* Died Date */}
            <div>
              <Label htmlFor={`died-date-${person?.id || 'new'}`}>Died Date</Label>
              <Input
                id={`died-date-${person?.id || 'new'}`}
                value={editingData.died?.date || ''}
                onChange={(e) => onUpdateNestedField('died', 'date', e.target.value)}
                placeholder="e.g. 1995-12-03"
                data-testid={`input-died-date-${person?.id || 'new'}`}
              />
            </div>

            {/* Died Place */}
            <div>
              <Label htmlFor={`died-place-${person?.id || 'new'}`}>Died Place</Label>
              <Input
                id={`died-place-${person?.id || 'new'}`}
                value={editingData.died?.place || ''}
                onChange={(e) => onUpdateNestedField('died', 'place', e.target.value)}
                placeholder="e.g. Krakow, Poland"
                data-testid={`input-died-place-${person?.id || 'new'}`}
              />
            </div>

            {/* Parents */}
            <div className="md:col-span-2">
              <Label>Parents (max 2)</Label>
              <div className="space-y-2">
                {[0, 1].map((index) => (
                  <Select
                    key={index}
                    value={editingData.parents?.[index] || ''}
                    onValueChange={(value) => {
                      const newParents = [...(editingData.parents || [])];
                      if (value) {
                        newParents[index] = value;
                      } else {
                        newParents.splice(index, 1);
                      }
                      onUpdateField('parents', newParents);
                    }}
                  >
                    <SelectTrigger data-testid={`select-parent-${index}-${person?.id || 'new'}`}>
                      <SelectValue placeholder={`Select parent ${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent</SelectItem>
                      {availableParents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {getPersonDisplayName(parent)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={onSave}
              disabled={mutations.save.isPending}
              data-testid={`button-save-person-${person?.id || 'new'}`}
            >
              {mutations.save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              data-testid={`button-cancel-edit-${person?.id || 'new'}`}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Display View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <Label>Name</Label>
              <p className="font-medium">{getPersonDisplayName(displayData)}</p>
            </div>

            {/* Sex */}
            <div>
              <Label>Sex</Label>
              <Badge variant="outline">{displayData.sex || 'Unknown'}</Badge>
            </div>

            {/* Born */}
            <div>
              <Label>Born</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{displayData.born?.date || 'Unknown'}</span>
              </div>
              {displayData.born?.place && (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">{displayData.born.place}</span>
                </div>
              )}
            </div>

            {/* Died */}
            {(displayData.died?.date || displayData.died?.place) && (
              <div>
                <Label>Died</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{displayData.died?.date || 'Unknown'}</span>
                </div>
                {displayData.died?.place && (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">{displayData.died.place}</span>
                  </div>
                )}
              </div>
            )}

            {/* Parents */}
            {displayData.parents && displayData.parents.length > 0 && (
              <div className="md:col-span-2">
                <Label>Parents</Label>
                <div className="flex gap-2 flex-wrap">
                  {displayData.parents.map((parentId) => {
                    const parent = availableParents.find(p => p.id === parentId);
                    return (
                      <Badge key={parentId} variant="secondary">
                        {getPersonDisplayName(parent) || parentId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {editMode && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={onEdit}
                data-testid={`button-edit-person-${person.id}`}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {!isProband && onSetProband && (
                <Button 
                  variant="outline" 
                  onClick={onSetProband}
                  disabled={mutations.setProband.isPending}
                  data-testid={`button-set-proband-${person.id}`}
                >
                  {mutations.setProband.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Crown className="h-4 w-4 mr-2" />
                  Set as Proband
                </Button>
              )}
              <Button 
                variant="destructive" 
                onClick={onDelete}
                disabled={mutations.delete.isPending || isProband}
                data-testid={`button-delete-person-${person.id}`}
              >
                {mutations.delete.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}