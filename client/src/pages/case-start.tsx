import CaseStartSteps from "@/components/case-start-steps";
import { Helmet } from "react-helmet-async";

export default function CaseStart() {
  return (
    <>
      <Helmet>
        <title>How to Start Your Case - Polish Citizenship</title>
        <meta name="description" content="Learn how to start your Polish citizenship application with our simple 5-step process. Register, submit documents, and begin your journey to EU citizenship." />
      </Helmet>
      <CaseStartSteps compact={false} />
    </>
  );
}