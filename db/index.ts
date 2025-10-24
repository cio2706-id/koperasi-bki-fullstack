import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as businessSchema from './schema/business';

export const db = drizzle(process.env.DATABASE_URL!);

// Export all schemas for easy importing
export { authSchema, businessSchema };

// Export specific tables for convenience
export const {
    user,
    session,
    account,
    verification
} = authSchema;

export const {
    profiles,
    paymentRequests,
    paymentApprovalHistory,
    loanApplications,
    loanApprovalHistory,
    userRoleEnum,
    paymentRequestStatusEnum,
    loanTypeEnum,
    loanApplicationStatusEnum
} = businessSchema;