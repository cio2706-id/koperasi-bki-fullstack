import { NextRequest, NextResponse } from 'next/server';
import { db, paymentRequests, profiles } from '@/db/index.js';
import { eq, and, desc, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const trackingNumber = searchParams.get('trackingNumber');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // If tracking number is provided, return single payment request
        if (trackingNumber) {
            const paymentRequest = await db
                .select({
                    id: paymentRequests.id,
                    trackingNumber: paymentRequests.trackingNumber,
                    requestorName: paymentRequests.requestorName,
                    requestorEmail: paymentRequests.requestorEmail,
                    itemDescription: paymentRequests.itemDescription,
                    estimatedPrice: paymentRequests.estimatedPrice,
                    approvedPrice: paymentRequests.approvedPrice,
                    status: paymentRequests.status,
                    rejectionReason: paymentRequests.rejectionReason,
                    createdAt: paymentRequests.createdAt,
                    updatedAt: paymentRequests.updatedAt,
                })
                .from(paymentRequests)
                .where(eq(paymentRequests.trackingNumber, trackingNumber))
                .limit(1);

            if (paymentRequest.length === 0) {
                return NextResponse.json(
                    { error: 'Payment request not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: paymentRequest[0],
            });
        }

        // Build query conditions
        let whereCondition = undefined;
        if (status) {
            whereCondition = eq(paymentRequests.status, status);
        }

        // Get list of payment requests
        const paymentRequestsList = await db
            .select({
                id: paymentRequests.id,
                trackingNumber: paymentRequests.trackingNumber,
                requestorName: paymentRequests.requestorName,
                requestorEmail: paymentRequests.requestorEmail,
                itemDescription: paymentRequests.itemDescription,
                estimatedPrice: paymentRequests.estimatedPrice,
                approvedPrice: paymentRequests.approvedPrice,
                status: paymentRequests.status,
                rejectionReason: paymentRequests.rejectionReason,
                createdAt: paymentRequests.createdAt,
                updatedAt: paymentRequests.updatedAt,
            })
            .from(paymentRequests)
            .where(whereCondition)
            .orderBy(desc(paymentRequests.createdAt))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            success: true,
            data: paymentRequestsList,
            pagination: {
                limit,
                offset,
                total: paymentRequestsList.length,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/payment-requests:', error);
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
            requestorName,
            requestorEmail,
            itemDescription,
            estimatedPrice,
        } = body;

        if (!requestorName || !itemDescription || !estimatedPrice) {
            return NextResponse.json(
                { error: 'Missing required fields: requestorName, itemDescription, estimatedPrice' },
                { status: 400 }
            );
        }

        // Validate estimated price
        const price = parseFloat(estimatedPrice);
        if (isNaN(price) || price <= 0) {
            return NextResponse.json(
                { error: 'Invalid estimated price' },
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (requestorEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(requestorEmail)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
        }

        // Generate unique tracking number
        const trackingNumber = `BKI-PO-${Date.now()}`;

        // Insert payment request
        const newPaymentRequest = await db
            .insert(paymentRequests)
            .values({
                trackingNumber,
                requestorName: requestorName.trim(),
                requestorEmail: requestorEmail?.trim() || null,
                itemDescription: itemDescription.trim(),
                estimatedPrice: price,
                status: 'PENDING_STAFF_APPROVAL',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning({
                id: paymentRequests.id,
                trackingNumber: paymentRequests.trackingNumber,
                requestorName: paymentRequests.requestorName,
                requestorEmail: paymentRequests.requestorEmail,
                itemDescription: paymentRequests.itemDescription,
                estimatedPrice: paymentRequests.estimatedPrice,
                status: paymentRequests.status,
                createdAt: paymentRequests.createdAt,
            });

        return NextResponse.json({
            success: true,
            data: newPaymentRequest[0],
            message: 'Payment request created successfully',
        });
    } catch (error) {
        console.error('Error in POST /api/payment-requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}