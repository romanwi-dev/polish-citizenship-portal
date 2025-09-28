import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function EnhancedFAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simple instant filter functionality
    const items = Array.from(document.querySelectorAll('.faq-section'));
    const handleSearch = () => {
      const q = searchQuery.trim().toLowerCase();
      items.forEach(el => {
        const txt = el.textContent?.toLowerCase() || '';
        el.classList.toggle('hidden', Boolean(q && !txt.includes(q)));
      });
    };
    handleSearch();
  }, [searchQuery]);

  return (
    <div style={{ 
      '--fg': '#111827', 
      '--bg': '#ffffff', 
      '--muted': '#6b7280',
      '--card': '#f9fafb', 
      '--border': '#e5e7eb', 
      '--brand': '#b30000'
    } as React.CSSProperties}>
      
      {/* Inline SVG Sprite */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
        <symbol id="icon-eligibility" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2"/>
            <circle cx="6" cy="12" r="2"/>
            <circle cx="18" cy="12" r="2"/>
            <path d="M12 6v2M6 10h12M6 10v2M18 10v2"/>
            <circle cx="17.5" cy="19" r="3"/>
            <path d="M16.3 19l1 1 1.9-2"/>
          </g>
        </symbol>
        <symbol id="icon-process" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4.5" width="14" height="12" rx="2" ry="2"/>
            <path d="M3 8h14M7 3v3M13 3v3"/>
            <circle cx="19" cy="18" r="3.5"/>
            <path d="M19 16.5v1.8l1.2.7"/>
          </g>
        </symbol>
        <symbol id="icon-costs" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="16" cy="9" r="4"/>
            <circle cx="9" cy="13" r="5"/>
            <path d="M11 11.5c-1-1.5-4-1.5-5 0c-1 1.5-1 3.5 0 5c1 1.5 4 1.5 5 0"/>
            <path d="M6.5 12.5h3.8M6.5 14.5h3.8"/>
          </g>
        </symbol>
        <symbol id="icon-docs" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
            <path d="M14 3v4h4"/>
            <circle cx="12" cy="14" r="2.5"/>
            <path d="M11 16.5l-1.5 2M13 16.5l1.5 2"/>
            <path d="M8 9h6M8 11h8"/>
          </g>
        </symbol>
        <symbol id="icon-issues" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 3l2 2-6.5 6.5-2-2z"/>
            <path d="M5.5 8.5l2 2"/>
            <path d="M18 4.5a2.5 2.5 0 0 1-3.5 3.5l-6.2 6.2a2.5 2.5 0 1 0 3.5 3.5l6.2-6.2A2.5 2.5 0 1 1 18 4.5z"/>
            <circle cx="18.5" cy="18.5" r="3"/>
            <path d="M17.3 18.5l1 1 1.7-2"/>
          </g>
        </symbol>
      </svg>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <header className="mb-7">
          <h1 className="text-8xl lg:text-9xl xl:text-[10rem] font-bold mb-6 tracking-tight leading-[0.8] text-center">
            <span className="block text-black dark:text-white">Find Answers</span>
            <span className="block text-blue-600 dark:text-blue-400">Instantly</span>
          </h1>
        </header>

        <div className="mb-7 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p>
            Important: Polish citizenship by descent is complex, document-heavy, and time-intensive.
            We <em>specialize</em> in difficult cases—especially pre-1920 emigration from territories that later became Poland.
            Legal representation requires two core rules: follow our advice and cooperate properly.
          </p>
        </div>

        <div className="mb-7">
          <input 
            type="search" 
            placeholder="Type to filter questions (e.g., pre-1920, naturalization, translations)…" 
            aria-label="Filter FAQ"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900"
          />
        </div>

        <nav className="flex flex-wrap gap-2 mb-6" aria-label="FAQ sections">
          <a href="#eligibility" className="px-3 py-2 border border-gray-200 rounded-lg no-underline text-gray-900 bg-gray-50 hover:bg-gray-100">ELIGIBILITY & REQUIREMENTS</a>
          <a href="#process" className="px-3 py-2 border border-gray-200 rounded-lg no-underline text-gray-900 bg-gray-50 hover:bg-gray-100">PROCESS & TIMELINE</a>
          <a href="#costs" className="px-3 py-2 border border-gray-200 rounded-lg no-underline text-gray-900 bg-gray-50 hover:bg-gray-100">COSTS & INVESTMENT</a>
          <a href="#documents" className="px-3 py-2 border border-gray-200 rounded-lg no-underline text-gray-900 bg-gray-50 hover:bg-gray-100">DOCUMENTS & LEGAL REQUIREMENTS</a>
          <a href="#issues" className="px-3 py-2 border border-gray-200 rounded-lg no-underline text-gray-900 bg-gray-50 hover:bg-gray-100">COMMON ISSUES & SOLUTIONS</a>
        </nav>

        {/* ELIGIBILITY & REQUIREMENTS */}
        <section id="eligibility" className="faq-section mt-12 mb-7">
          <div className="flex items-center gap-3 mb-4 text-blue-900">
            <svg className="w-12 h-12 stroke-current fill-none stroke-2" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true">
              <use href="#icon-eligibility"/>
            </svg>
            <h2 className="text-2xl font-bold tracking-widest m-0 text-blue-900">ELIGIBILITY & REQUIREMENTS</h2>
          </div>

          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="eligibility-1" className="responsive-card">
              <AccordionTrigger className="accordion-trigger text-left !text-lg !font-normal hover:no-underline wrap">
                Who is eligible for Polish citizenship by descent?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                People of Polish descent whose ancestor(s) were Polish citizens and did not lose that citizenship before the next generation was born. There is no generation limit in the law; eligibility depends on the rules in force at each point in time (especially 1920–1951 vs. after 1951) and on the paper trail connecting you to the Polish citizen ancestor. Confirmation is decided by the competent voivode.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eligibility-2" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What if my ancestor left before 1920?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Leaving before 1920 does not automatically make you ineligible. Under the 1920 Citizenship Act and related treaty provisions, people connected to territories that became Poland could acquire (or be deemed to have acquired) Polish citizenship based on domicile/right of residence—even if they had emigrated earlier. We assess where the ancestor was domiciled on 31 January 1920 and shortly after. These cases are complex and document-heavy—our specialty.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eligibility-3" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Can I apply through my grandmother's line?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Yes—maternal lines can qualify. The exact rule depends on the child's date of birth and historical statutes (pre-1951 father-line rules for children born in wedlock; later laws removed that constraint). We check the relevant era and confirm no loss event occurred before your parent's birth.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eligibility-4" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Can I claim through my great-grandparents?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Yes, if we can show your great-grandparent held Polish citizenship and that it passed unbroken to your grandparent, then to your parent, then to you (i.e., no loss in between). It usually requires deeper archives work and multi-generation civil records.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eligibility-5" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Do I need to speak Polish?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                No. Confirmation by descent recognizes citizenship you already hold by law; it's not naturalization. There is no language test. Filings are in Polish, with sworn translations where needed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* PROCESS & TIMELINE */}
        <section id="process" className="faq-section mt-12 mb-7">
          <div className="flex items-center gap-3 mb-4 text-blue-900">
            <svg className="w-12 h-12 stroke-current fill-none stroke-2" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true">
              <use href="#icon-process"/>
            </svg>
            <h2 className="text-2xl font-bold tracking-widest m-0 text-blue-900">PROCESS & TIMELINE</h2>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="process-1" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Why does confirmation take time?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Realistic end-to-end timing is 18–48+ months. The curve is driven by archives searches (sometimes in multiple countries), certified translations, and the voivode's legal assessment. Government processing times vary with volume and case complexity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process-2" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Where do I file if I live outside Poland?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Decisions are issued by the voivode. If you don't reside in Poland and have no last residence there, the competent authority is the Mazowiecki Voivode (Warsaw). You can file via a Polish consulate or through a representative in Poland.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process-3" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What happens during the government phase?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                The voivode verifies documents, checks historical statutes against your family timeline, and confirms that no loss event occurred before each next generation's birth. You may receive requests for clarifications or additional records.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process-4" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Can the process be expedited?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                We can accelerate our parts—document procurement, translations, file-readiness. Government decision times cannot be guaranteed or shortened by any service provider.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process-5" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What happens after a positive decision?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                You're officially recognized as a Polish citizen. Next, we transcribe your foreign civil records into the Polish Civil Registry (Polish birth/marriage certificates), obtain/confirm PESEL, then apply in person for a Polish passport (often via a consulate).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* COSTS & INVESTMENT */}
        <section id="costs" className="faq-section mt-12 mb-7">
          <div className="flex items-center gap-3 mb-4 text-blue-900">
            <svg className="w-12 h-12 stroke-current fill-none stroke-2" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true">
              <use href="#icon-costs"/>
            </svg>
            <h2 className="text-2xl font-bold tracking-widest m-0 text-blue-900">COSTS & INVESTMENT</h2>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="costs-1" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What is the total cost and how do payments work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Your legal investment depends on complexity and service tier (Standard / Expedited / VIP). We use installments tied to milestones. Translations are billed separately based on volume and difficulty.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="costs-2" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What official fees should I expect?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Decision fee (Poland): 277 PLN for the voivode's decision confirming possession (or loss) of Polish citizenship. Power of attorney: 17 PLN (if you appoint one; close-family exemptions may apply). Consular transmission fee (if filing via consulate): varies by post. We'll confirm which fees apply in your scenario.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="costs-3" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Are there other expenses?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Yes: sworn translations, archive searches (including abroad), apostilles/legalizations where needed, courier, and later, civil-act transcription and passport costs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="costs-4" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Do you offer installment plans?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Yes. Payments are staged to milestones (POAs, filing, follow-ups, decision, civil acts, passport file). This maps to how the work unfolds.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="costs-5" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Is there a success fee or refund?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                We price for work performed at each stage. If a case ends early or needs re-filing/appeal, we settle fairly based on completed work. Appeals are possible; outcomes depend on facts and evidence.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* DOCUMENTS & LEGAL REQUIREMENTS */}
        <section id="documents" className="faq-section mt-12 mb-7">
          <div className="flex items-center gap-3 mb-4 text-blue-900">
            <svg className="w-12 h-12 stroke-current fill-none stroke-2" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true">
              <use href="#icon-docs"/>
            </svg>
            <h2 className="text-2xl font-bold tracking-widest m-0 text-blue-900">DOCUMENTS & LEGAL REQUIREMENTS</h2>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="documents-1" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What documents prove my claim?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                A paper chain linking you to the Polish citizen ancestor: multi-generation birth/marriage/death certificates; Polish records (passports/IDs, military, domicile/right-of-residence); and naturalization/non-naturalization records from the country of emigration. Originals or properly certified copies are required; foreign documents need sworn translations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents-2" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What if my ancestor's Polish records were destroyed?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Common problem, solvable. We run archive searches in Poland and, where relevant, Ukraine and other countries, and rebuild proof from independent sources (civil and church books, residency registers, voter lists, military rolls, partition-era files).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents-3" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Do I need to prove my ancestor never renounced Polish citizenship?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                What matters is whether a loss event happened before the next generation was born.<br/>
                After 19 January 1951: acquiring another citizenship did not cause loss. Today, loss happens only by formal renunciation with the President's consent.<br/>
                Before 19 January 1951 (1920 Act period): women generally lost Polish citizenship upon acquiring a foreign citizenship (including via marriage in some eras). Men did not lose it by naturalization alone; loss required service in a foreign army or accepting foreign public office before 19 January 1951.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents-4" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Do translations have to be done in Poland?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                All foreign-language documents must be translated by a Polish Sworn Translator (or by a Polish consul). We handle translator selection and quality control; fixing poor translations later is costly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents-5" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Do I need Polish civil records before I can get a passport?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Yes. After citizenship is confirmed, your foreign birth/marriage certificates must be transcribed into the Polish Civil Registry. Only then can you apply for a Polish passport.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* COMMON ISSUES & SOLUTIONS */}
        <section id="issues" className="faq-section mt-12 mb-7">
          <div className="flex items-center gap-3 mb-4 text-blue-900">
            <svg className="w-12 h-12 stroke-current fill-none stroke-2" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true">
              <use href="#icon-issues"/>
            </svg>
            <h2 className="text-2xl font-bold tracking-widest m-0 text-blue-900">COMMON ISSUES & SOLUTIONS</h2>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="issues-1" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                "Pre-1920 emigration" cases
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                This is our specialty. Pre-1920 departure is not an automatic disqualifier. We analyze domicile/right of residence under the 1920 Act and treaty provisions to establish Polish citizenship despite early emigration.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issues-2" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                "My ancestor naturalized abroad—does that break the chain?"
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Not necessarily. On/after 19 January 1951: no loss under Polish law due to foreign naturalization. Before that date, women generally lost citizenship upon acquiring foreign citizenship; men did not lose it by naturalization alone—loss required foreign army service or foreign public office before 19 January 1951. We verify dates and facts from naturalization certificates and service/office records.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issues-3" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Our surname changed after immigration. Is that a problem?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                No. We bridge name changes through court orders, immigration files, ship manifests, census/voter lists, and consistent vital records so the identity chain stays intact.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issues-4" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                Can Americans keep their U.S. citizenship after confirmation?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Yes. Poland permits dual citizenship, and post-1951 U.S. naturalization does not cause loss of Polish citizenship under Polish law. Use the correct passport with each country's authorities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="issues-5" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="text-left !text-lg !font-normal hover:no-underline">
                What if the application is refused?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 !text-lg">
                Refusals usually stem from missing or inconsistent evidence, not true ineligibility. We review the decision, appeal where justified, or re-file with additional evidence.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <footer className="mt-9 text-gray-500 text-sm text-center">
          © Polish Citizenship by Descent — FAQ
        </footer>

        <style>{`
          .hidden {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}