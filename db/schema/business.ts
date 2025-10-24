import {
    pgTable,
    uuid,
    text,
    numeric,
    integer,
    timestamp,
    boolean,
    pgEnum
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enums for status fields
export const userRoleEnum = pgEnum("user_role", [
    "member",
    "staff_pengadaan",
    "staff_treasury",
    "staff_piutang",
    "staff_akunting",
    "manager",
    "sekretaris",
    "bendahara",
    "ketua",
    "admin"
]);

export const paymentRequestStatusEnum = pgEnum("payment_request_status", [
    "PENDING_STAFF_APPROVAL",
    "PENDING_MANAGER_APPROVAL",
    "APPROVED",
    "REJECTED",
    "SPP_PROCESSED",
    "PROCESSED",
    "ITEM_RECEIVED",
    "COMPLETED"
]);

export const loanTypeEnum = pgEnum("loan_type", [
    "REGULAR",
    "KHUSUS",
    "BARANG",
    "TRAVEL"
]);

export const loanApplicationStatusEnum = pgEnum("loan_application_status", [
    "DRAFT",
    "PENDING_TREASURY_REVIEW",
    "PENDING_MANAGER_APPROVAL",
    "PENDING_BENDAHARA_APPROVAL",
    "PENDING_KETUA_APPROVAL",
    "APPROVED_PENDING_POSTING",
    "POSTED_TO_ACCURATE",
    "REJECTED"
]);

// Business tables

export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").unique().references(() => user.id, { onDelete: "cascade" }),
    accurateEmployeeId: integer("accurate_employee_id").unique(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentRequests = pgTable("payment_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    trackingNumber: text("tracking_number").notNull().unique(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
    requestorName: text("requestor_name").notNull(),
    requestorEmail: text("requestor_email"),
    itemDescription: text("item_description").notNull(),
    estimatedPrice: numeric("estimated_price", { precision: 12, scale: 2 }).notNull(),
    approvedPrice: numeric("approved_price", { precision: 12, scale: 2 }),
    fileUploadUrl: text("file_upload_url"),
    proofOfDeliveryUrl: text("proof_of_delivery_url"),
    status: paymentRequestStatusEnum("status").notNull().default("PENDING_STAFF_APPROVAL"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentApprovalHistory = pgTable("payment_approval_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentRequestId: uuid("payment_request_id").references(() => paymentRequests.id, { onDelete: "cascade" }),
    changedBy: uuid("changed_by").references(() => profiles.id),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    notes: text("notes"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const loanApplications = pgTable("loan_applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    trackingNumber: text("tracking_number").notNull().unique(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    loanType: loanTypeEnum("loan_type").notNull(),
    amountRequested: numeric("amount_requested", { precision: 12, scale: 2 }).notNull(),
    repaymentMonths: integer("repayment_months").notNull(),
    monthlyInstallment: numeric("monthly_installment", { precision: 12, scale: 2 }).notNull(),
    interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
    totalRepayment: numeric("total_repayment", { precision: 12, scale: 2 }).notNull(),
    purpose: text("purpose").notNull(),
    fileUploadUrl: text("file_upload_url"),
    status: loanApplicationStatusEnum("status").notNull().default("DRAFT"),
    accurateCoa: text("accurate_coa"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loanApprovalHistory = pgTable("loan_approval_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    loanApplicationId: uuid("loan_application_id").references(() => loanApplications.id, { onDelete: "cascade" }),
    changedBy: uuid("changed_by").references(() => profiles.id),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    notes: text("notes"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Type exports for TypeScript usage
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type NewPaymentRequest = typeof paymentRequests.$inferInsert;
export type PaymentApprovalHistory = typeof paymentApprovalHistory.$inferSelect;
export type NewPaymentApprovalHistory = typeof paymentApprovalHistory.$inferInsert;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type NewLoanApplication = typeof loanApplications.$inferInsert;
export type LoanApprovalHistory = typeof loanApprovalHistory.$inferSelect;
export type NewLoanApprovalHistory = typeof loanApprovalHistory.$inferInsert;