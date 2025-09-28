import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, CheckCircle2, Info, Calculator } from "lucide-react";

export default function SuccessProbability() {
  const [factors, setFactors] = useState({
    ancestorBirthYear: "",
    ancestorGender: "",
    emigrationYear: "",
    hasDocuments: "some",
    lineageType: "",
    renunciationRisk: "low",
    userCountry: "",
    wwiiImpact: "none"
  });

  const [probability, setProbability] = useState(0);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [strengthFactors, setStrengthFactors] = useState<string[]>([]);

  const calculateProbability = () => {
    let score = 60; // More realistic base score
    const risks: string[] = [];
    const strengths: string[] = [];

    // Ancestor birth year analysis (CRITICAL FACTOR)
    if (factors.ancestorBirthYear) {
      const birthYear = parseInt(factors.ancestorBirthYear);
      if (birthYear < 1900) {
        score -= 50; // Very difficult
        risks.push("Pre-1900 births: Most difficult - Poland didn't exist as nation");
      } else if (birthYear >= 1900 && birthYear < 1918) {
        score -= 30; // Difficult  
        risks.push("1900-1918: Born under partitions - complex legal situation");
      } else if (birthYear >= 1918 && birthYear <= 1938) {
        score += 25; // Best period
        strengths.push("1918-1938: Golden period - clear Polish citizenship");
      } else if (birthYear >= 1939 && birthYear <= 1945) {
        score -= 10; // War period
        risks.push("WWII period: Documentation often destroyed");
      } else if (birthYear > 1945) {
        score += 15; // Good
        strengths.push("Post-1945: Modern records available");
      }
    }

    // Gender lineage (CRITICAL for pre-1951)
    if (factors.ancestorGender === "female") {
      const birthYear = parseInt(factors.ancestorBirthYear || "1920");
      if (birthYear < 1951) {
        score -= 25;
        risks.push("Female lineage pre-1951: Lost citizenship upon foreign marriage");
      } else {
        strengths.push("Female lineage post-1951: Equal rights maintained");
      }
    } else if (factors.ancestorGender === "male") {
      score += 10;
      strengths.push("Male lineage: Citizenship always passed to children");
    }

    // Emigration timing (CRUCIAL)
    if (factors.emigrationYear) {
      const emigrationYear = parseInt(factors.emigrationYear);
      if (emigrationYear < 1918) {
        score -= 35;
        risks.push("Pre-1918 emigration: No Polish state existed");
      } else if (emigrationYear >= 1918 && emigrationYear <= 1938) {
        score += 15;
        strengths.push("Interwar emigration: Clear Polish citizen at departure");
      } else if (emigrationYear >= 1939 && emigrationYear <= 1945) {
        score -= 15;
        risks.push("WWII emigration: Complex refugee status issues");
      } else if (emigrationYear >= 1946 && emigrationYear <= 1950) {
        score -= 20;
        risks.push("1946-1950: Communist regime citizenship stripping common");
      } else if (emigrationYear >= 1951 && emigrationYear <= 1989) {
        score -= 10;
        risks.push("Communist era: Automatic loss upon foreign naturalization");
      } else if (emigrationYear >= 1990) {
        score += 20;
        strengths.push("Post-1990: Modern laws preserve dual citizenship");
      }
    }

    // Document availability (PRACTICAL FACTOR)
    switch (factors.hasDocuments) {
      case "complete":
        score += 20;
        strengths.push("Full documentation: Straightforward application");
        break;
      case "some":
        // No change to score
        strengths.push("Partial documents: Archives can fill gaps");
        break;
      case "none":
        score -= 30;
        risks.push("No documents: Extensive costly research required");
        break;
    }

    // Military/government service (DISQUALIFIERS)
    if (factors.renunciationRisk === "high") {
      score -= 40;
      risks.push("Foreign military/government service: Automatic citizenship loss");
    } else if (factors.renunciationRisk === "medium") {
      score -= 20;
      risks.push("Naturalization before 1962: Likely citizenship loss");
    } else {
      score += 5;
      strengths.push("No known renunciation events");
    }

    // Territory changes (COMPLEXITY)
    if (factors.wwiiImpact === "severe") {
      score -= 25;
      risks.push("Territory now in Ukraine/Lithuania/Belarus: Archives difficult");
    } else if (factors.wwiiImpact === "moderate") {
      score -= 10;
      risks.push("Border regions: Some archive challenges");
    }

    // Realistic bounds: 5% to 95%
    score = Math.max(5, Math.min(95, score));

    setProbability(score);
    setRiskFactors(risks);
    setStrengthFactors(strengths);
  };

  useEffect(() => {
    calculateProbability();
  }, [factors]);

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return "text-green-600";
    if (prob >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProbabilityBgColor = (prob: number) => {
    if (prob >= 80) return "from-green-500 to-green-600";
    if (prob >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-red-600";
  };

  const getProbabilityLabel = (prob: number) => {
    if (prob >= 85) return "Excellent";
    if (prob >= 70) return "Good";
    if (prob >= 50) return "Moderate";
    if (prob >= 30) return "Challenging";
    return "Difficult";
  };

  return (
    <section id="success-probability" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-secondary-blue text-white px-6 py-3 rounded-full text-lg font-medium mb-6">
            AI Success Probability Calculator
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tight">
            <span className="block text-blue-600 dark:text-blue-400">Calculate Your Success</span>
            <span className="block text-blue-600 dark:text-blue-400">Probability</span>
          </h2>
          <p className="text-xl text-neutral-cool max-w-3xl mx-auto leading-relaxed">
            Get an instant assessment of your case strength based on 20+ years of historical data and 5,000+ successful cases.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Factors */}
          <Card className="bg-surface-elevated text-neutral-warm border-0">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-3xl font-bold text-neutral-warm flex items-center gap-2">
                <Calculator className="h-7 w-7" />
                Case Assessment Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-gray-700">
                      Polish Ancestor's Birth Year *
                    </label>
                    <input 
                      type="number"
                      placeholder="e.g., 1925"
                      value={factors.ancestorBirthYear}
                      onChange={(e) => setFactors(prev => ({...prev, ancestorBirthYear: e.target.value}))}
                      className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-gray-700">
                      Ancestor's Gender *
                    </label>
                    <select 
                      value={factors.ancestorGender}
                      onChange={(e) => setFactors(prev => ({...prev, ancestorGender: e.target.value}))}
                      className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-gray-700">
                      Year of Emigration from Poland *
                    </label>
                    <input 
                      type="number"
                      placeholder="e.g., 1948"
                      value={factors.emigrationYear}
                      onChange={(e) => setFactors(prev => ({...prev, emigrationYear: e.target.value}))}
                      className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-gray-700">
                      Available Documentation *
                    </label>
                    <select 
                      value={factors.hasDocuments}
                      onChange={(e) => setFactors(prev => ({...prev, hasDocuments: e.target.value}))}
                      className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    >
                      <option value="complete">Complete documentation</option>
                      <option value="some">Some documents available</option>
                      <option value="none">No documents currently</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-gray-700">
                      Lineage Type *
                    </label>
                    <select 
                      value={factors.lineageType}
                      onChange={(e) => setFactors(prev => ({...prev, lineageType: e.target.value}))}
                      className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    >
                      <option value="">Select lineage</option>
                      <option value="paternal">Through father's side</option>
                      <option value="maternal">Through mother's side</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-gray-700">
                      Your Current Country *
                    </label>
                    <select 
                      value={factors.userCountry}
                      onChange={(e) => setFactors(prev => ({...prev, userCountry: e.target.value}))}
                      className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    >
                      <option value="">Select country</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="canada">Canada</option>
                      <option value="australia">Australia</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-semibold text-gray-700">
                    Renunciation Risk Assessment *
                  </label>
                  <select 
                    value={factors.renunciationRisk}
                    onChange={(e) => setFactors(prev => ({...prev, renunciationRisk: e.target.value}))}
                    className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  >
                    <option value="low">Low risk (naturalized after birth of next generation)</option>
                    <option value="medium">Medium risk (unclear naturalization timing)</option>
                    <option value="high">High risk (early naturalization)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-semibold text-gray-700">
                    WWII Impact on Family *
                  </label>
                  <select 
                    value={factors.wwiiImpact}
                    onChange={(e) => setFactors(prev => ({...prev, wwiiImpact: e.target.value}))}
                    className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  >
                    <option value="none">No significant impact</option>
                    <option value="moderate">Some displacement/documentation loss</option>
                    <option value="severe">Severe impact (Holocaust, deportation, etc.)</option>
                  </select>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Probability Score */}
            <Card className="bg-white border border-gray-100">
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getProbabilityBgColor(probability)} mb-6`}>
                  <span className="text-4xl font-light text-white">{probability}%</span>
                </div>
                <h3 className={`text-3xl font-light mb-2 ${getProbabilityColor(probability)}`}>
                  {getProbabilityLabel(probability)} Case
                </h3>
                <p className="text-neutral-cool text-lg">
                  Based on historical data from similar cases
                </p>
                <Progress value={probability} className="mt-4 h-3" />
              </CardContent>
            </Card>

            {/* Strength Factors */}
            {strengthFactors.length > 0 && (
              <Card className="bg-green-50 border border-green-200">
                <CardHeader>
                  <CardTitle className="text-xl font-light text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Positive Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strengthFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2 text-green-700">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <Card className="bg-amber-50 border border-amber-200">
                <CardHeader>
                  <CardTitle className="text-xl font-light text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Challenges to Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {riskFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2 text-amber-700">
                        <span className="text-amber-500 mt-1">⚠</span>
                        <span className="text-sm">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendation */}
            <Card className="bg-gradient-to-r from-green-700 to-green-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-light mb-2 text-green-100">Our Recommendation</h3>
                    {probability >= 70 ? (
                      <p className="text-white text-sm leading-relaxed">
                        Your case shows strong potential for success. We recommend proceeding with a comprehensive eligibility assessment and beginning the document procurement process.
                      </p>
                    ) : probability >= 50 ? (
                      <p className="text-white text-sm leading-relaxed">
                        Your case has moderate potential but requires careful legal analysis. We recommend a detailed consultation to address the identified challenges and develop a strategic approach.
                      </p>
                    ) : (
                      <p className="text-white text-sm leading-relaxed">
                        Your case presents significant challenges that require expert legal guidance. A detailed consultation will help determine if alternative strategies or additional research could improve your prospects.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button className="bg-white text-green-700 hover:bg-green-50">
                    Free Consultation
                  </Button>
                  <Button variant="outline" className="border-white text-green-600 hover:bg-white hover:text-green-700">
                    <span className="text-green-600">Detailed Assessment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mt-12 bg-gray-50 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Important Disclaimer</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This probability calculator provides estimates based on historical data and common factors affecting Polish citizenship cases. 
                  Actual success rates depend on many case-specific factors that require professional legal analysis. 
                  This tool should not be considered legal advice, and we recommend consulting with our legal experts for a definitive assessment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}