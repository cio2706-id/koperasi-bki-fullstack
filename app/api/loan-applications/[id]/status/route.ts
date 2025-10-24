import { NextRequest, NextResponse } from 'next/server';
import { db, loanApplications, loanApprovalHistory, profiles, accurateAPI } from '@/db/index.js';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const loanApplicationId = params.id;
        const body = await request.json();

        const { status, notes, changedByProfileId } = body;

        // Validate required fields
        if (!status || !changedByProfileId) {
            return NextResponse.json(
                { error: 'Missing required fields: status, changedByProfileId' },
                { status: 400 }
            );
        }

        // Validate status transitions
        const validStatuses = [
            'DRAFT',
            'PENDING_TREASURY_REVIEW',
            'PENDING_MANAGER_APPROVAL',
            'PENDING_BENDAHARA_APPROVAL',
            'PENDING_KETUA_APPROVAL',
            'APPROVED_PENDING_POSTING',
            'POSTED_TO_ACCURATE',
            'REJECTED'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Get current loan application with user details
        const currentLoanApplication = await db
            .select({
                loan: loanApplications,
                profile: profiles,
            })
            .from(loanApplications)
            .leftJoin(profiles, eq(loanApplications.userId, profiles.id))
            .where(eq(loanApplications.id, loanApplicationId))
            .limit(1);

        if (currentLoanApplication.length === 0) {
            return NextResponse.json(
                { error: 'Loan application not found' },
                { status: 404 }
            );
        }

        const currentApplication = currentLoanApplication[0];
        const fromStatus = currentApplication.loan.status;

        // Validate status transition logic
        if (!isValidStatusTransition(fromStatus, status)) {
            return NextResponse.json(
                { error: `Invalid status transition from ${fromStatus} to ${status}` },
                { status: 400 }
            );
        }

        // Update loan application
        await db
            .update(loanApplications)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(loanApplications.id, loanApplicationId));

        // Add rejection reason if rejected
        if (status === 'REJECTED' && notes) {
            await db
                .update(loanApplications)
                .set({ rejectionReason: notes })
                .where(eq(loanApplications.id, loanApplicationId));
        }

        // Log the status change in history
        await db.insert(loanApprovalHistory).values({
            loanApplicationId,
            changedBy: changedByProfileId,
            fromStatus,
            toStatus: status,
            notes: notes || null,
            timestamp: new Date(),
        });

        // Get updated loan application
        const updatedLoanApplication = await db
            .select()
            .from(loanApplications)
            .where(eq(loanApplications.id, loanApplicationId))
            .limit(1);

        return NextResponse.json({
            success: true,
            data: updatedLoanApplication[0],
            message: `Loan application status updated to ${status}`,
        });
    } catch (error) {
        console.error('Error in PATCH /api/loan-applications/[id]/status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const loanApplicationId = params.id;
        const body = await request.json();

        const { changedByProfileId, coaAccount } = body;

        // Validate required fields
        if (!changedByProfileId) {
            return NextResponse.json(
                { error: 'Missing required field: changedByProfileId' },
                { status: 400 }
            );
        }

        // Get loan application details
        const loanApplication = await db
            .select({
                loan: loanApplications,
                profile: profiles,
            })
            .from(loanApplications)
            .leftJoin(profiles, eq(loanApplications.userId, profiles.id))
            .where(eq(loanApplications.id, loanApplicationId))
            .limit(1);

        if (loanApplication.length === 0) {
            return NextResponse.json(
                { error: 'Loan application not found' },
                { status: 404 }
            );
        }

        const application = loanApplication[0];

        // Check if loan is ready for posting
        if (application.loan.status !== 'APPROVED_PENDING_POSTING') {
            return NextResponse.json(
                { error: 'Loan application is not ready for posting to Accurate.id' },
                { status: 400 }
            );
        }

        // Determine COA account
        const finalCoaAccount = coaAccount || accurateAPI.getLoanCOA(application.loan.loanType);

        // Generate journal voucher data
        const voucherData = accurateAPI.generateLoanVoucherData(
            application.profile.accurateEmployeeId || 0,
            parseFloat(application.loan.amountRequested.toString()),
            application.loan.loanType,
            finalCoaAccount,
            `Pencairan Pinjaman ${application.loan.loanType} - ${application.profile.fullName}`
        );

        // Post to Accurate.id
        const postingResult = await accurateAPI.createJournalVoucher(voucherData);

        if (postingResult.success) {
            // Update loan application status
            await db
                .update(loanApplications)
                .set({
                    status: 'POSTED_TO_ACCURATE',
                    accurateCoa: finalCoaAccount,
                    updatedAt: new Date(),
                })
                .where(eq(loanApplications.id, loanApplicationId));

            // Log the posting in history
            await db.insert(loanApprovalHistory).values({
                loanApplicationId,
                changedBy: changedByProfileId,
                fromStatus: 'APPROVED_PENDING_POSTING',
                toStatus: 'POSTED_TO_ACCURATE',
                notes: `Posted to Accurate.id with voucher ID: ${postingResult.voucherId}`,
                timestamp: new Date(),
            });

            return NextResponse.json({
                success: true,
                data: {
                    voucherId: postingResult.voucherId,
                    coaAccount: finalCoaAccount,
                    message: 'Loan successfully posted to Accurate.id',
                },
            });
        } else {
            return NextResponse.json(
                { error: postingResult.error || 'Failed to post loan to Accurate.id' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in POST /api/loan-applications/[id]/status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function isValidStatusTransition(fromStatus: string, toStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
        'DRAFT': ['PENDING_TREASURY_REVIEW', 'REJECTED'],
        'PENDING_TREASURY_REVIEW': ['PENDING_MANAGER_APPROVAL', 'REJECTED'],
        'PENDING_MANAGER_APPROVAL': ['PENDING_BENDAHARA_APPROVAL', 'REJECTED'],
        'PENDING_BENDAHARA_APPROVAL': ['PENDING_KETUA_APPROVAL', 'REJECTED'],
        'PENDING_KETUA_APPROVAL': ['APPROVED_PENDING_POSTING', 'REJECTED'],
        'APPROVED_PENDING_POSTING': ['POSTED_TO_ACCURATE'],
        'POSTED_TO_ACCURATE': [], // Terminal state
        'REJECTED': [], // Terminal state
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
}