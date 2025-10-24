import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, profiles } from '@/db/index.js';
import { eq } from 'drizzle-orm';

export type UserRole =
    | 'member'
    | 'staff_pengadaan'
    | 'staff_treasury'
    | 'staff_piutang'
    | 'staff_akunting'
    | 'manager'
    | 'sekretaris'
    | 'bendahara'
    | 'ketua'
    | 'admin';

// Define role permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    member: [
        'view:own_dashboard',
        'view:own_savings',
        'view:own_loans',
        'create:loan_application',
        'view:own_applications'
    ],
    staff_pengadaan: [
        'view:payment_requests',
        'approve:payment_requests_staff',
        'reject:payment_requests_staff',
        'view:dashboard_procurement'
    ],
    staff_treasury: [
        'view:loan_applications',
        'review:loan_applications',
        'approve:loan_applications_treasury',
        'reject:loan_applications_treasury',
        'post:loan_to_accurate',
        'process:payment_spp',
        'view:dashboard_treasury'
    ],
    staff_piutang: [
        'view:payment_requests',
        'update:payment_status_shipped',
        'view:dashboard_piutang'
    ],
    staff_akunting: [
        'view:payment_requests',
        'complete:payment_requests',
        'view:dashboard_accounting'
    ],
    manager: [
        'view:payment_requests',
        'approve:payment_requests_manager',
        'reject:payment_requests_manager',
        'view:loan_applications',
        'approve:loan_applications_manager',
        'reject:loan_applications_manager',
        'view:dashboard_manager'
    ],
    sekretaris: [
        'view:admin_dashboard',
        'view:all_users',
        'view:reports'
    ],
    bendahara: [
        'view:loan_applications',
        'approve:loan_applications_bendahara',
        'reject:loan_applications_bendahara',
        'view:dashboard_bendahara'
    ],
    ketua: [
        'view:loan_applications',
        'approve:loan_applications_ketua',
        'reject:loan_applications_ketua',
        'view:dashboard_ketua',
        'view:all_users',
        'manage:user_roles'
    ],
    admin: [
        // Admin has all permissions
        ...Object.values({
            member: true,
            staff_pengadaan: true,
            staff_treasury: true,
            staff_piutang: true,
            staff_akunting: true,
            manager: true,
            sekretaris: true,
            bendahara: true,
            ketua: true,
        }).flatMap(permissions =>
            typeof permissions === 'boolean' ? [] : Object.keys(ROLE_PERMISSIONS).flatMap(role => ROLE_PERMISSIONS[role as UserRole])
        )
    ]
};

// Helper function to check if a role has a specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

// Middleware function to check user permissions
export async function requireAuth(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return {
            success: false,
            error: 'Authentication required',
            status: 401,
        };
    }

    // Get user profile with role
    const userProfiles = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, session.user.id))
        .limit(1);

    if (userProfiles.length === 0) {
        return {
            success: false,
            error: 'User profile not found',
            status: 404,
        };
    }

    return {
        success: true,
        user: session.user,
        profile: userProfiles[0],
        role: userProfiles[0].role as UserRole,
    };
}

// Middleware function to require specific permission
export async function requirePermission(
    request: NextRequest,
    requiredPermission: string
) {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
        return authResult;
    }

    const { role } = authResult;

    if (!hasPermission(role as UserRole, requiredPermission)) {
        return {
            success: false,
            error: 'Insufficient permissions',
            status: 403,
        };
    }

    return authResult;
}

// Middleware function to require specific role
export async function requireRole(request: NextRequest, requiredRoles: UserRole | UserRole[]) {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
        return authResult;
    }

    const { role } = authResult;
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!allowedRoles.includes(role as UserRole)) {
        return {
            success: false,
            error: 'Access denied: insufficient role',
            status: 403,
        };
    }

    return authResult;
}

// Helper functions for common role checks
export async function isStaff(request: NextRequest) {
    return requireRole(request, [
        'staff_pengadaan',
        'staff_treasury',
        'staff_piutang',
        'staff_akunting'
    ]);
}

export async function isManager(request: NextRequest) {
    return requireRole(request, 'manager');
}

export async function isPengurus(request: NextRequest) {
    return requireRole(request, ['bendahara', 'ketua']);
}

export async function isAdmin(request: NextRequest) {
    return requireRole(request, ['admin', 'ketua']);
}

// Get user-friendly role names
export const ROLE_NAMES: Record<UserRole, string> = {
    member: 'Anggota',
    staff_pengadaan: 'Staf Pengadaan',
    staff_treasury: 'Staf Treasury',
    staff_piutang: 'Staf Piutang',
    staff_akunting: 'Staf Akunting',
    manager: 'Manager',
    sekretaris: 'Sekretaris',
    bendahara: 'Bendahara',
    ketua: 'Ketua',
    admin: 'Administrator',
};

// Get role hierarchy (higher number = higher privilege)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    member: 1,
    staff_pengadaan: 2,
    staff_treasury: 2,
    staff_piutang: 2,
    staff_akunting: 2,
    manager: 3,
    sekretaris: 3,
    bendahara: 4,
    ketua: 5,
    admin: 6,
};