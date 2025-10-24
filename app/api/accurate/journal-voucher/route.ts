import { NextRequest, NextResponse } from 'next/server';
import { accurateAPI } from '@/lib/accurate';
import { JournalVoucherRequest } from '@/lib/accurate';

export async function POST(request: NextRequest) {
    try {
        const body: JournalVoucherRequest = await request.json();

        // Validate required fields
        if (!body.transDate || !body.description || !body.journalVoucherNo || !body.journalVoucherDetails) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate journal voucher details
        if (!Array.isArray(body.journalVoucherDetails) || body.journalVoucherDetails.length === 0) {
            return NextResponse.json(
                { error: 'Journal voucher details are required' },
                { status: 400 }
            );
        }

        // Validate that debits equal credits
        const totalDebit = body.journalVoucherDetails.reduce((sum, detail) => sum + (detail.debit || 0), 0);
        const totalCredit = body.journalVoucherDetails.reduce((sum, detail) => sum + (detail.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return NextResponse.json(
                { error: 'Total debits must equal total credits' },
                { status: 400 }
            );
        }

        const result = await accurateAPI.createJournalVoucher(body);

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: {
                    voucherId: result.voucherId,
                    message: 'Journal voucher created successfully',
                },
            });
        } else {
            return NextResponse.json(
                { error: result.error || 'Failed to create journal voucher' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in /api/accurate/journal-voucher:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}