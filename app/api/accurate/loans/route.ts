import { NextRequest, NextResponse } from 'next/server';
import { accurateAPI } from '@/lib/accurate';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');

        if (!employeeId) {
            return NextResponse.json(
                { error: 'Employee ID parameter is required' },
                { status: 400 }
            );
        }

        // Validate employee ID
        const empId = parseInt(employeeId);
        if (isNaN(empId) || empId <= 0) {
            return NextResponse.json(
                { error: 'Invalid employee ID' },
                { status: 400 }
            );
        }

        const loanData = await accurateAPI.getEmployeeLoans(empId);

        return NextResponse.json({
            success: true,
            data: loanData,
        });
    } catch (error) {
        console.error('Error in /api/accurate/loans:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}