-- Create enums first
CREATE TYPE "user_role" AS ENUM('member', 'staff_pengadaan', 'staff_treasury', 'staff_piutang', 'staff_akunting', 'manager', 'sekretaris', 'bendahara', 'ketua', 'admin');
--> statement-breakpoint
CREATE TYPE "payment_request_status" AS ENUM('PENDING_STAFF_APPROVAL', 'PENDING_MANAGER_APPROVAL', 'APPROVED', 'REJECTED', 'SPP_PROCESSED', 'PROCESSED', 'ITEM_RECEIVED', 'COMPLETED');
--> statement-breakpoint
CREATE TYPE "loan_type" AS ENUM('REGULAR', 'KHUSUS', 'BARANG', 'TRAVEL');
--> statement-breakpoint
CREATE TYPE "loan_application_status" AS ENUM('DRAFT', 'PENDING_TREASURY_REVIEW', 'PENDING_MANAGER_APPROVAL', 'PENDING_BENDAHARA_APPROVAL', 'PENDING_KETUA_APPROVAL', 'APPROVED_PENDING_POSTING', 'POSTED_TO_ACCURATE', 'REJECTED');
--> statement-breakpoint
-- Create profiles table
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"accurate_employee_id" integer,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_accurate_employee_id_unique" UNIQUE("accurate_employee_id"),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
-- Create payment_requests table
CREATE TABLE "payment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_number" text NOT NULL,
	"profile_id" uuid,
	"requestor_name" text NOT NULL,
	"requestor_email" text,
	"item_description" text NOT NULL,
	"estimated_price" numeric(12,2) NOT NULL,
	"approved_price" numeric(12,2),
	"file_upload_url" text,
	"proof_of_delivery_url" text,
	"status" "payment_request_status" DEFAULT 'PENDING_STAFF_APPROVAL' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_requests_tracking_number_unique" UNIQUE("tracking_number")
);
--> statement-breakpoint
-- Create payment_approval_history table
CREATE TABLE "payment_approval_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_request_id" uuid NOT NULL,
	"changed_by" uuid,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"notes" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Create loan_applications table
CREATE TABLE "loan_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_number" text NOT NULL,
	"user_id" uuid NOT NULL,
	"loan_type" "loan_type" NOT NULL,
	"amount_requested" numeric(12,2) NOT NULL,
	"repayment_months" integer NOT NULL,
	"monthly_installment" numeric(12,2) NOT NULL,
	"interest_rate" numeric(5,2) NOT NULL,
	"total_repayment" numeric(12,2) NOT NULL,
	"purpose" text NOT NULL,
	"file_upload_url" text,
	"status" "loan_application_status" DEFAULT 'DRAFT' NOT NULL,
	"accurate_coa" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_applications_tracking_number_unique" UNIQUE("tracking_number")
);
--> statement-breakpoint
-- Create loan_approval_history table
CREATE TABLE "loan_approval_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_application_id" uuid NOT NULL,
	"changed_by" uuid,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"notes" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Add foreign key constraints
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_approval_history" ADD CONSTRAINT "payment_approval_history_payment_request_id_payment_requests_id_fk" FOREIGN KEY ("payment_request_id") REFERENCES "public"."payment_requests"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_approval_history" ADD CONSTRAINT "payment_approval_history_changed_by_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "loan_approval_history" ADD CONSTRAINT "loan_approval_history_loan_application_id_loan_applications_id_fk" FOREIGN KEY ("loan_application_id") REFERENCES "public"."loan_applications"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "loan_approval_history" ADD CONSTRAINT "loan_approval_history_changed_by_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;