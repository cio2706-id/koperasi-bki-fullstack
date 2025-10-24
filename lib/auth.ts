import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema/auth";
import { accurateAPI } from "@/lib/accurate";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user: user,
            account: account,
            session: session,
            verification: verification,
        }
    }),
    emailAndPassword: {
        enabled: false, // Disable password-based auth, use magic links only
    },
    emailVerification: {
        sendOnSignUp: false, // Don't send verification on signup
        expiresIn: 300, // 5 minutes
    },
    magicLinks: {
        enabled: true,
        expiresIn: 900, // 15 minutes
        sendMagicLink: async ({ email, url }) => {
            // Check if email exists in Accurate.id
            try {
                const employee = await accurateAPI.getEmployeeByEmail(email);

                if (!employee) {
                    console.log(`Email ${email} not found in Accurate.id`);
                    return false; // Don't send magic link if employee not found
                }

                console.log(`Sending magic link to ${email} for employee ${employee.name}`);

                // In development, log the magic link URL
                if (process.env.NODE_ENV === 'development') {
                    console.log('🔗 Magic Link URL:', url);
                    return true;
                }

                // In production, send email using your email service
                // For now, we'll simulate sending the email
                // TODO: Implement actual email sending logic here
                const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/send-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: email,
                        subject: 'Koperasi Pegawai BKI - Login Link',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #2563eb;">Koperasi Pegawai BKI</h2>
                                <p>Halo ${employee.name},</p>
                                <p>Anda telah meminta link untuk masuk ke sistem Koperasi Pegawai BKI.</p>
                                <p>Klik tombol di bawah ini untuk masuk:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                        Masuk ke Sistem
                                    </a>
                                </div>
                                <p>Link ini akan kedaluwarsa dalam 15 menit.</p>
                                <p>Jika Anda tidak meminta link ini, abaikan email ini.</p>
                                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                                <p style="color: #6b7280; font-size: 14px;">
                                    Email ini dikirim otomatis oleh sistem Koperasi Pegawai BKI.
                                </p>
                            </div>
                        `,
                    }),
                });

                return response.ok;
            } catch (error) {
                console.error('Error sending magic link:', error);
                return false;
            }
        },
    },
    socialProviders: {
        // Disabled for now - we're using Accurate.id integration instead
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
        generateId: false, // Use UUID from database
    },
    hooks: {
        after: [
            {
                matcher(context) {
                    return context.path === "/sign-in/magic-link" && context.user?.email;
                },
                handler: async (ctx) => {
                    // After successful magic link authentication,
                    // check if user exists in our profiles table
                    if (ctx.user?.email) {
                        const { db } = await import('@/db');
                        const { profiles } = await import('@/db/schema/business');
                        const { eq } = await import('drizzle-orm');

                        // Check if profile exists
                        const existingProfile = await db
                            .select()
                            .from(profiles)
                            .where(eq(profiles.email, ctx.user.email))
                            .limit(1);

                        if (existingProfile.length === 0) {
                            // Profile doesn't exist, create it with default 'member' role
                            try {
                                const employee = await accurateAPI.getEmployeeByEmail(ctx.user.email);

                                await db.insert(profiles).values({
                                    userId: ctx.user.id,
                                    accurateEmployeeId: employee?.id || null,
                                    fullName: ctx.user.name || '',
                                    email: ctx.user.email,
                                    role: 'member', // Default role
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                });

                                console.log(`Created profile for ${ctx.user.email} with member role`);
                            } catch (error) {
                                console.error('Error creating profile after login:', error);
                                // Continue even if profile creation fails
                            }
                        }
                    }
                },
            },
        ],
    },
});