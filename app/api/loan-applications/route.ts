import { NextRequest, NextResponse } from 'next/server';
import { db, loanApplications, profiles, accurateAPI } from '@/db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { loanTypeEnum } from '@/db/schema/business.js';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const trackingNumber = searchParams.get('trackingNumber');
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // If tracking number is provided, return single loan application
        if (trackingNumber) {
            const loanApplication = await db
                .select({
                    id: loanApplications.id,
                    trackingNumber: loanApplications.trackingNumber,
                    userId: loanApplications.userId,
                    loanType: loanApplications.loanType,
                    amountRequested: loanApplications.amountRequested,
                    repaymentMonths: loanApplications.repaymentMonths,
                    monthlyInstallment: loanApplications.monthlyInstallment,
                    interestRate: loanApplications.interestRate,
                    totalRepayment: loanApplications.totalRepayment,
                    purpose: loanApplications.purpose,
                    status: loanApplications.status,
                    rejectionReason: loanApplications.rejectionReason,
                    accurateCoa: loanApplications.accurateCoa,
                    createdAt: loanApplications.createdAt,
                    updatedAt: loanApplications.updatedAt,
                    userName: profiles.fullName,
                    userEmail: profiles.email,
                })
                .from(loanApplications)
                .leftJoin(profiles, eq(loanApplications.userId, profiles.id))
                .where(eq(loanApplications.trackingNumber, trackingNumber))
                .limit(1);

            if (loanApplication.length === 0) {
                return NextResponse.json(
                    { error: 'Loan application not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: loanApplication[0],
            });
        }

        // Build query conditions
        let whereCondition = undefined;
        if (status) {
            whereCondition = eq(loanApplications.status, status);
        }
        if (userId) {
            whereCondition = whereCondition
                ? and(whereCondition, eq(loanApplications.userId, userId))
                : eq(loanApplications.userId, userId);
        }

        // Get list of loan applications
        const loanApplicationsList = await db
            .select({
                id: loanApplications.id,
                trackingNumber: loanApplications.trackingNumber,
                userId: loanApplications.userId,
                loanType: loanApplications.loanType,
                amountRequested: loanApplications.amountRequested,
                repaymentMonths: loanApplications.repaymentMonths,
                monthlyInstallment: loanApplications.monthlyInstallment,
                interestRate: loanApplications.interestRate,
                totalRepayment: loanApplications.totalRepayment,
                purpose: loanApplications.purpose,
                status: loanApplications.status,
                rejectionReason: loanApplications.rejectionReason,
                accurateCoa: loanApplications.accurateCoa,
                createdAt: loanApplications.createdAt,
                updatedAt: loanApplications.updatedAt,
                userName: profiles.fullName,
                userEmail: profiles.email,
            })
            .from(loanApplications)
            .leftJoin(profiles, eq(loanApplications.userId, profiles.id))
            .where(whereCondition)
            .orderBy(desc(loanApplications.createdAt))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            success: true,
            data: loanApplicationsList,
            pagination: {
                limit,
                offset,
                total: loanApplicationsList.length,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/loan-applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const {
            userId,
            loanType,
            amountRequested,
            repaymentMonths,
            interestRate,
            purpose,
        } = body;

        if (!userId || !loanType || !amountRequested || !repaymentMonths || !interestRate || !purpose) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, loanType, amountRequested, repaymentMonths, interestRate, purpose' },
                { status: 400 }
            );
        }

        // Validate loan type
        if (!loanTypeEnum.enumValues.includes(loanType)) {
            return NextResponse.json(
                { error: 'Invalid loan type' },
                { status: 400 }
            );
        }

        // Validate numeric fields
        const amount = parseFloat(amountRequested);
        const months = parseInt(repaymentMonths);
        const rate = parseFloat(interestRate);

        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid loan amount' },
                { status: 400 }
            );
        }

        if (isNaN(months) || months <= 0 || months > 60) {
            return NextResponse.json(
                { error: 'Invalid repayment period (must be 1-60 months)' },
                { status: 400 }
            );
        }

        if (isNaN(rate) || rate < 0 || rate > 100) {
            return NextResponse.json(
                { error: 'Invalid interest rate' },
                { status: 400 }
            );
        }

        // Calculate monthly installment and total repayment
        const monthlyRate = rate / 100 / 12;
        const monthlyInstallment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalRepayment = monthlyInstallment * months;

        // Generate unique tracking number
        const trackingNumber = `BKI-LOAN-${Date.now()}`;

        // Insert loan application
        const newLoanApplication = await db
            .insert(loanApplications)
            .values({
                trackingNumber,
                userId,
                loanType,
                amountRequested: amount,
                repaymentMonths: months,
                monthlyInstallment: Math.round(monthlyInstallment * 100) / 100, // Round to 2 decimal places
                interestRate: rate,
                totalRepayment: Math.round(totalRepayment * 100) / 100, // Round to 2 decimal places
                purpose: purpose.trim(),
                status: 'DRAFT',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning({
                id: loanApplications.id,
                trackingNumber: loanApplications.trackingNumber,
                userId: loanApplications.userId,
                loanType: loanApplications.loanType,
                amountRequested: loanApplications.amountRequested,
                repaymentMonths: loanApplications.repaymentMonths,
                monthlyInstallment: loanApplications.monthlyInstallment,
                interestRate: loanApplications.interestRate,
                totalRepayment: loanApplications.totalRepayment,
                purpose: loanApplications.purpose,
                status: loanApplications.status,
                createdAt: loanApplications.createdAt,
            });

        return NextResponse.json({
            success: true,
            data: newLoanApplication[0],
            message: 'Loan application created successfully',
        });
    } catch (error) {
        console.error('Error in POST /api/loan-applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}