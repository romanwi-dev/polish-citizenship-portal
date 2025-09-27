CREATE TABLE "consultation_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text NOT NULL,
	"service_interest" text NOT NULL,
	"processing_type" text,
	"family_size" text,
	"message" text,
	"budget_range" text,
	"timeline_preference" text,
	"has_documents" text,
	"privacy_consent" boolean NOT NULL,
	"marketing_consent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eligibility_assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text NOT NULL,
	"birth_year" text,
	"polish_ancestor" text NOT NULL,
	"ancestor_birth_year" text,
	"ancestor_birth_place" text,
	"has_polish_documents" text NOT NULL,
	"emigration_year" text,
	"current_citizenship" text,
	"family_members" text,
	"urgency" text,
	"case_complexity" text,
	"budget_range" text,
	"timeline_expectation" text,
	"additional_info" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
