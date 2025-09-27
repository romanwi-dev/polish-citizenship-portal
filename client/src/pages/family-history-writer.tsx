import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Users, 
  Calendar, 
  MapPin, 
  Ship, 
  Home,
  Award,
  BookOpen,
  Download,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  Flag,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FamilyMember {
  id: string;
  relationship: string;
  fullName: string;
  polishName?: string;
  birthDate: string;
  birthPlace: string;
  deathDate?: string;
  deathPlace?: string;
  emigrationDate?: string;
  emigrationFrom?: string;
  emigrationTo?: string;
  emigrationShip?: string;
  citizenship?: string;
  occupation?: string;
  militaryService?: string;
  documents?: string[];
  notes?: string;
}

interface KeyEvent {
  id: string;
  year: string;
  event: string;
  location: string;
  significance: string;
  documentation?: string;
}

const FamilyHistoryWriter = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [progress, setProgress] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [keyEvents, setKeyEvents] = useState<KeyEvent[]>([]);
  const [currentMember, setCurrentMember] = useState<FamilyMember>({
    id: "",
    relationship: "",
    fullName: "",
    birthDate: "",
    birthPlace: ""
  });

  // Narrative sections
  const [narrative, setNarrative] = useState({
    introduction: "",
    ancestralOrigins: "",
    emigrationStory: "",
    familyLife: "",
    culturalPreservation: "",
    citizenshipClaim: "",
    conclusion: ""
  });

  // Pre-written templates and suggestions
  const templates = {
    introduction: [
      "My family's Polish heritage traces back to [ANCESTOR NAME], who was born in [LOCATION] in [YEAR].",
      "This family history documents my direct lineage to Polish citizens, establishing my eligibility for Polish citizenship by descent.",
      "Our family's connection to Poland began with [ANCESTOR NAME], a Polish citizen who maintained their citizenship throughout their life."
    ],
    emigrationStory: [
      "In [YEAR], facing [CIRCUMSTANCES], my [RELATIONSHIP] made the difficult decision to leave Poland.",
      "The journey from [POLISH CITY] to [DESTINATION] took [DURATION], traveling aboard the [SHIP NAME].",
      "Economic hardship/political persecution/war forced my family to seek a new life while maintaining their Polish identity."
    ],
    culturalPreservation: [
      "Despite living abroad, our family maintained strong Polish traditions including [TRADITIONS].",
      "Polish was spoken at home, and traditional Polish dishes like [FOODS] were regularly prepared.",
      "Our family celebrated Polish holidays such as Wigilia (Christmas Eve) and maintained connections with relatives in Poland."
    ]
  };

  const calculateProgress = useCallback(() => {
    let completed = 0;
    const total = 10;
    
    if (familyMembers.length > 0) completed += 2;
    if (narrative.introduction) completed++;
    if (narrative.ancestralOrigins) completed++;
    if (narrative.emigrationStory) completed++;
    if (narrative.familyLife) completed++;
    if (narrative.culturalPreservation) completed++;
    if (narrative.citizenshipClaim) completed++;
    if (narrative.conclusion) completed++;
    if (keyEvents.length > 0) completed++;
    
    setProgress((completed / total) * 100);
  }, [familyMembers, narrative, keyEvents]);

  const addFamilyMember = () => {
    if (!currentMember.fullName || !currentMember.relationship) {
      toast({
        title: "Missing Information",
        description: "Please provide at least the name and relationship.",
        variant: "destructive"
      });
      return;
    }

    const newMember = {
      ...currentMember,
      id: Date.now().toString()
    };

    setFamilyMembers([...familyMembers, newMember]);
    setCurrentMember({
      id: "",
      relationship: "",
      fullName: "",
      birthDate: "",
      birthPlace: ""
    });
    
    toast({
      title: "Family Member Added",
      description: `${newMember.fullName} has been added to your family history.`
    });
    
    calculateProgress();
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
    calculateProgress();
  };

  const addKeyEvent = () => {
    const newEvent: KeyEvent = {
      id: Date.now().toString(),
      year: "",
      event: "",
      location: "",
      significance: ""
    };
    setKeyEvents([...keyEvents, newEvent]);
  };

  const generateNarrative = () => {
    const polishAncestor = familyMembers.find(m => 
      m.relationship.toLowerCase().includes('great') || 
      m.relationship.toLowerCase().includes('grand')
    );

    if (!polishAncestor) {
      toast({
        title: "Missing Ancestor Information",
        description: "Please add at least one Polish ancestor to generate the narrative.",
        variant: "destructive"
      });
      return;
    }

    const generatedIntro = `This family history documents my direct lineage to ${polishAncestor.fullName}, ` +
      `who was born in ${polishAncestor.birthPlace} on ${polishAncestor.birthDate}. ` +
      `As my ${polishAncestor.relationship}, they form the foundation of my claim to Polish citizenship by descent.`;

    setNarrative({
      ...narrative,
      introduction: generatedIntro
    });

    toast({
      title: "Narrative Generated",
      description: "A draft narrative has been created based on your family information."
    });
  };

  const exportToPDF = () => {
    // In a real implementation, this would generate a PDF
    toast({
      title: "Exporting to PDF",
      description: "Your family history is being prepared for download..."
    });
  };

  const saveProgress = () => {
    localStorage.setItem('familyHistory', JSON.stringify({
      familyMembers,
      keyEvents,
      narrative
    }));
    
    toast({
      title: "Progress Saved",
      description: "Your family history has been saved locally."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Essential for Citizenship Applications
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Family History Writer
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Create a compelling family narrative that documents your Polish ancestry 
            and strengthens your citizenship application.
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 bg-white/20 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Completion Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/30" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ancestors">Ancestors</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="narrative">Narrative</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Document Your Polish Ancestors</p>
                        <p className="text-sm text-gray-600">Add details about family members born in Poland</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Create a Timeline</p>
                        <p className="text-sm text-gray-600">Record key events in your family history</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Write Your Narrative</p>
                        <p className="text-sm text-gray-600">Tell your family's story with guided prompts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Export for Application</p>
                        <p className="text-sm text-gray-600">Generate a professional PDF document</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Important Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">
                      <strong>Be Specific:</strong> Include exact dates, places, and names whenever possible.
                    </p>
                    <p className="text-sm">
                      <strong>Document Sources:</strong> Reference birth certificates, ship manifests, and other documents.
                    </p>
                    <p className="text-sm">
                      <strong>Show Continuity:</strong> Demonstrate unbroken Polish citizenship through generations.
                    </p>
                    <p className="text-sm">
                      <strong>Include Context:</strong> Explain historical events that affected your family.
                    </p>
                    <p className="text-sm">
                      <strong>Cultural Connection:</strong> Mention how Polish traditions were preserved.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Ancestors Tab */}
            <TabsContent value="ancestors">
              <Card>
                <CardHeader>
                  <CardTitle>Add Family Members</CardTitle>
                  <CardDescription>
                    Start with your Polish ancestor and work forward through generations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Relationship</Label>
                      <Select 
                        value={currentMember.relationship}
                        onValueChange={(value) => setCurrentMember({...currentMember, relationship: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="great-great-grandparent">Great-Great-Grandparent</SelectItem>
                          <SelectItem value="great-grandparent">Great-Grandparent</SelectItem>
                          <SelectItem value="grandparent">Grandparent</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="Jan Kowalski"
                        value={currentMember.fullName}
                        onChange={(e) => setCurrentMember({...currentMember, fullName: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Polish Name (if different)</Label>
                      <Input 
                        placeholder="Original Polish spelling"
                        value={currentMember.polishName}
                        onChange={(e) => setCurrentMember({...currentMember, polishName: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Birth Date</Label>
                      <Input 
                        type="date"
                        value={currentMember.birthDate}
                        onChange={(e) => setCurrentMember({...currentMember, birthDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Birth Place</Label>
                      <Input 
                        placeholder="Warsaw, Poland"
                        value={currentMember.birthPlace}
                        onChange={(e) => setCurrentMember({...currentMember, birthPlace: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Emigration Date</Label>
                      <Input 
                        type="date"
                        value={currentMember.emigrationDate}
                        onChange={(e) => setCurrentMember({...currentMember, emigrationDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Emigration From</Label>
                      <Input 
                        placeholder="Bremen, Germany (port)"
                        value={currentMember.emigrationFrom}
                        onChange={(e) => setCurrentMember({...currentMember, emigrationFrom: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Emigration To</Label>
                      <Input 
                        placeholder="Ellis Island, New York"
                        value={currentMember.emigrationTo}
                        onChange={(e) => setCurrentMember({...currentMember, emigrationTo: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Ship Name (if applicable)</Label>
                      <Input 
                        placeholder="SS Polonia"
                        value={currentMember.emigrationShip}
                        onChange={(e) => setCurrentMember({...currentMember, emigrationShip: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Occupation</Label>
                      <Input 
                        placeholder="Farmer, merchant, etc."
                        value={currentMember.occupation}
                        onChange={(e) => setCurrentMember({...currentMember, occupation: e.target.value})}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label>Additional Notes</Label>
                      <Textarea 
                        placeholder="Any additional information about this family member..."
                        value={currentMember.notes}
                        onChange={(e) => setCurrentMember({...currentMember, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={addFamilyMember} className="mb-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Family Member
                  </Button>

                  {/* Family Members List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Added Family Members</h3>
                    {familyMembers.length === 0 ? (
                      <p className="text-gray-500">No family members added yet.</p>
                    ) : (
                      familyMembers.map(member => (
                        <Card key={member.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{member.fullName}</p>
                                <p className="text-sm text-gray-600">
                                  {member.relationship} • Born {member.birthDate} in {member.birthPlace}
                                </p>
                                {member.emigrationDate && (
                                  <p className="text-sm text-gray-600">
                                    Emigrated {member.emigrationDate} from {member.emigrationFrom} to {member.emigrationTo}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFamilyMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Family Timeline</CardTitle>
                  <CardDescription>
                    Create a chronological timeline of significant events in your family's history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={addKeyEvent} className="mb-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>

                  <div className="space-y-4">
                    {keyEvents.map((event, index) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Year</Label>
                              <Input 
                                placeholder="1920"
                                value={event.year}
                                onChange={(e) => {
                                  const updated = [...keyEvents];
                                  updated[index].year = e.target.value;
                                  setKeyEvents(updated);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Location</Label>
                              <Input 
                                placeholder="Warsaw, Poland"
                                value={event.location}
                                onChange={(e) => {
                                  const updated = [...keyEvents];
                                  updated[index].location = e.target.value;
                                  setKeyEvents(updated);
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Event Description</Label>
                              <Input 
                                placeholder="Birth of Jan Kowalski"
                                value={event.event}
                                onChange={(e) => {
                                  const updated = [...keyEvents];
                                  updated[index].event = e.target.value;
                                  setKeyEvents(updated);
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Significance to Citizenship Claim</Label>
                              <Textarea 
                                placeholder="This establishes Polish citizenship at birth..."
                                value={event.significance}
                                onChange={(e) => {
                                  const updated = [...keyEvents];
                                  updated[index].significance = e.target.value;
                                  setKeyEvents(updated);
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Narrative Tab */}
            <TabsContent value="narrative">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Family Narrative</CardTitle>
                    <CardDescription>
                      Write your family's story using our guided sections
                    </CardDescription>
                    <Button onClick={generateNarrative} variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Draft from Data
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Introduction */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">1. Introduction</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Introduce your Polish ancestor and state your relationship
                      </p>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">Suggested Templates</Badge>
                        {templates.introduction.map((template, i) => (
                          <p key={i} className="text-xs text-gray-500 mt-1 italic">• {template}</p>
                        ))}
                      </div>
                      <Textarea 
                        placeholder="Begin your family history here..."
                        value={narrative.introduction}
                        onChange={(e) => setNarrative({...narrative, introduction: e.target.value})}
                        rows={4}
                      />
                    </div>

                    {/* Ancestral Origins */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">2. Ancestral Origins in Poland</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Describe your family's life in Poland before emigration
                      </p>
                      <Textarea 
                        placeholder="Describe the region, town, occupation, and life in Poland..."
                        value={narrative.ancestralOrigins}
                        onChange={(e) => setNarrative({...narrative, ancestralOrigins: e.target.value})}
                        rows={4}
                      />
                    </div>

                    {/* Emigration Story */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">3. The Emigration Journey</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Detail why and how your family left Poland
                      </p>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">Suggested Templates</Badge>
                        {templates.emigrationStory.map((template, i) => (
                          <p key={i} className="text-xs text-gray-500 mt-1 italic">• {template}</p>
                        ))}
                      </div>
                      <Textarea 
                        placeholder="Describe the reasons for leaving, the journey, and arrival..."
                        value={narrative.emigrationStory}
                        onChange={(e) => setNarrative({...narrative, emigrationStory: e.target.value})}
                        rows={4}
                      />
                    </div>

                    {/* Family Life */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">4. Life in the New Country</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Describe how your family established themselves
                      </p>
                      <Textarea 
                        placeholder="Describe settlement, work, family growth, challenges..."
                        value={narrative.familyLife}
                        onChange={(e) => setNarrative({...narrative, familyLife: e.target.value})}
                        rows={4}
                      />
                    </div>

                    {/* Cultural Preservation */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">5. Preserving Polish Heritage</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Explain how Polish culture was maintained
                      </p>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">Suggested Templates</Badge>
                        {templates.culturalPreservation.map((template, i) => (
                          <p key={i} className="text-xs text-gray-500 mt-1 italic">• {template}</p>
                        ))}
                      </div>
                      <Textarea 
                        placeholder="Describe traditions, language, food, connections to Poland..."
                        value={narrative.culturalPreservation}
                        onChange={(e) => setNarrative({...narrative, culturalPreservation: e.target.value})}
                        rows={4}
                      />
                    </div>

                    {/* Citizenship Claim */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">6. Basis for Citizenship Claim</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Explain why you qualify for Polish citizenship
                      </p>
                      <Textarea 
                        placeholder="State the legal basis for your claim, unbroken lineage..."
                        value={narrative.citizenshipClaim}
                        onChange={(e) => setNarrative({...narrative, citizenshipClaim: e.target.value})}
                        rows={4}
                      />
                    </div>

                    {/* Conclusion */}
                    <div>
                      <Label className="text-lg font-semibold mb-2">7. Conclusion</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Summarize your connection to Poland
                      </p>
                      <Textarea 
                        placeholder="Conclude with your desire to reclaim citizenship..."
                        value={narrative.conclusion}
                        onChange={(e) => setNarrative({...narrative, conclusion: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle>Export Your Family History</CardTitle>
                  <CardDescription>
                    Download your completed family history in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <FileText className="h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="font-semibold mb-2">PDF Document</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Professional formatted document ready for submission with your citizenship application
                        </p>
                        <Button onClick={exportToPDF} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export as PDF
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <Save className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="font-semibold mb-2">Save Progress</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Save your work locally to continue later or create backups
                        </p>
                        <Button onClick={saveProgress} variant="outline" className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save to Browser
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4 max-h-96 overflow-y-auto">
                        <div>
                          <h3 className="font-bold text-center text-xl mb-4">
                            Family History for Polish Citizenship Application
                          </h3>
                          <p className="text-center text-gray-600 mb-6">
                            Prepared on {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        
                        {narrative.introduction && (
                          <div>
                            <h4 className="font-semibold mb-2">Introduction</h4>
                            <p className="text-sm">{narrative.introduction}</p>
                          </div>
                        )}
                        
                        {familyMembers.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Family Members</h4>
                            {familyMembers.map(member => (
                              <p key={member.id} className="text-sm">
                                • {member.fullName} ({member.relationship}) - Born {member.birthDate} in {member.birthPlace}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {keyEvents.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Timeline of Events</h4>
                            {keyEvents.map(event => (
                              <p key={event.id} className="text-sm">
                                • {event.year}: {event.event} in {event.location}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Need Help with Your Family History?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our genealogy experts can help you research your Polish ancestry, 
                locate missing documents, and create a compelling family narrative 
                for your citizenship application.
              </p>
              <div className="flex gap-4">
                <Button>
                  Schedule Consultation
                </Button>
                <Button variant="outline">
                  View Sample Histories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FamilyHistoryWriter;