import { NextRequest, NextResponse } from 'next/server';
import { db, paymentRequests, paymentApprovalHistory, profiles } from '@/db/index.js';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const paymentRequestId = params.id;
        const body = await request.json();

        const { status, notes, changedByProfileId, approvedPrice } = body;

        // Validate required fields
        if (!status || !changedByProfileId) {
            return NextResponse.json(
                { error: 'Missing required fields: status, changedByProfileId' },
                { status: 400 }
            );
        }

        // Validate status transitions
        const validStatuses = [
            'PENDING_STAFF_APPROVAL',
            'PENDING_MANAGER_APPROVAL',
            'APPROVED',
            'REJECTED',
            'SPP_PROCESSED',
            'PROCESSED',
            'ITEM_RECEIVED',
            'COMPLETED'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Get current payment request
        const currentPaymentRequest = await db
            .select()
            .from(paymentRequests)
            .where(eq(paymentRequests.id, paymentRequestId))
            .limit(1);

        if (currentPaymentRequest.length === 0) {
            return NextResponse.json(
                { error: 'Payment request not found' },
                { status: 404 }
            );
        }

        const currentRequest = currentPaymentRequest[0];
        const fromStatus = currentRequest.status;

        // Validate status transition logic
        if (!isValidStatusTransition(fromStatus, status)) {
            return NextResponse.json(
                { error: `Invalid status transition from ${fromStatus} to ${status}` },
                { status: 400 }
            );
        }

        // Validate approved price if provided
        let updateData: any = {
            status,
            updatedAt: new Date(),
        };

        if (approvedPrice !== undefined) {
            const price = parseFloat(approvedPrice);
            if (isNaN(price) || price <= 0) {
                return NextResponse.json(
                    { error: 'Invalid approved price' },
                    { status: 400 }
                );
            }
            updateData.approvedPrice = price;
        }

        // Update payment request
        await db
            .update(paymentRequests)
            .set(updateData)
            .where(eq(paymentRequests.id, paymentRequestId));

        // Add rejection reason if rejected
        if (status === 'REJECTED' && notes) {
            await db
                .update(paymentRequests)
                .set({ rejectionReason: notes })
                .where(eq(paymentRequests.id, paymentRequestId));
        }

        // Log the status change in history
        await db.insert(paymentApprovalHistory).values({
            paymentRequestId,
            changedBy: changedByProfileId,
            fromStatus,
            toStatus: status,
            notes: notes || null,
            timestamp: new Date(),
        });

        // Get updated payment request
        const updatedPaymentRequest = await db
            .select()
            .from(paymentRequests)
            .where(eq(paymentRequests.id, paymentRequestId))
            .limit(1);

        return NextResponse.json({
            success: true,
            data: updatedPaymentRequest[0],
            message: `Payment request status updated to ${status}`,
        });
    } catch (error) {
        console.error('Error in PATCH /api/payment-requests/[id]/status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function isValidStatusTransition(fromStatus: string, toStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
        'PENDING_STAFF_APPROVAL': ['PENDING_MANAGER_APPROVAL', 'REJECTED'],
        'PENDING_MANAGER_APPROVAL': ['APPROVED', 'REJECTED'],
        'APPROVED': ['SPP_PROCESSED'],
        'SPP_PROCESSED': ['PROCESSED'],
        'PROCESSED': ['ITEM_RECEIVED'],
        'ITEM_RECEIVED': ['COMPLETED'],
        'REJECTED': [], // Terminal state
        'COMPLETED': [], // Terminal state
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
}