/**
 * Accurate.id API Integration Module
 *
 * This module provides a secure interface to interact with Accurate.id API endpoints.
 * All API calls are proxied through backend routes to keep credentials secure.
 */

export interface AccurateEmployee {
    id: number;
    name: string;
    email: string;
    // Add other fields as needed from Accurate.id API
}

export interface AccurateSavingsData {
    employeeId: number;
    totalSavings: number;
    savingsBreakdown: {
        wajib: number;
        pokok: number;
        sukarela: number;
    };
    lastUpdated: string;
}

export interface AccurateLoanData {
    employeeId: number;
    outstandingLoans: {
        regular: number;
        khusus: number;
        barang: number;
        travel: number;
    };
    totalOutstanding: number;
    lastUpdated: string;
}

export interface JournalVoucherRequest {
    transDate: string;
    description: string;
    journalVoucherNo: string;
    journalVoucherDetails: Array<{
        accountNo: string;
        debit: number;
        credit: number;
        memo: string;
        departmentId?: number;
        projectId?: number;
    }>;
}

export interface AccurateApiConfig {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    databaseId: string;
}

class AccurateAPI {
    private config: AccurateApiConfig;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor() {
        this.config = {
            baseUrl: process.env.ACCURATE_API_BASE_URL || 'https://accurate.id',
            clientId: process.env.ACCURATE_API_CLIENT_ID || '',
            clientSecret: process.env.ACCURATE_API_CLIENT_SECRET || '',
            databaseId: process.env.ACCURATE_API_DATABASE_ID || '',
        };
    }

    /**
     * Get OAuth access token from Accurate.id
     */
    private async getAccessToken(): Promise<string> {
        // Check if we have a valid cached token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await fetch(`${this.config.baseUrl}/oauth/authorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get access token: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;

            // Set token expiry (subtract 5 minutes for safety margin)
            this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

            return this.accessToken;
        } catch (error) {
            console.error('Error getting Accurate.id access token:', error);
            throw new Error('Failed to authenticate with Accurate.id');
        }
    }

    /**
     * Make authenticated API request to Accurate.id
     */
    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.getAccessToken();

        const url = `${this.config.baseUrl}/api/accurate/do/save.db?db=${this.config.databaseId}&${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        return fetch(url, { ...defaultOptions, ...options });
    }

    /**
     * Search for employee by email
     */
    async getEmployeeByEmail(email: string): Promise<AccurateEmployee | null> {
        try {
            const response = await this.makeRequest(`sp.json?name=employee_list&email=${encodeURIComponent(email)}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch employee: ${response.status}`);
            }

            const data = await response.json();

            // Accurate.id returns data in a specific format
            if (data && data.d && data.d.length > 0) {
                const employee = data.d[0];
                return {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching employee by email:', error);
            throw new Error('Failed to fetch employee data from Accurate.id');
        }
    }

    /**
     * Get employee savings data
     */
    async getEmployeeSavings(employeeId: number): Promise<AccurateSavingsData> {
        try {
            // This would need to be adjusted based on actual Accurate.id API endpoints
            const response = await this.makeRequest(`sp.json?name=savings_detail&id=${employeeId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch savings data: ${response.status}`);
            }

            const data = await response.json();

            // Parse the response according to Accurate.id format
            return {
                employeeId,
                totalSavings: data.totalSavings || 0,
                savingsBreakdown: {
                    wajib: data.savingsBreakdown?.wajib || 0,
                    pokok: data.savingsBreakdown?.pokok || 0,
                    sukarela: data.savingsBreakdown?.sukarela || 0,
                },
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error fetching employee savings:', error);
            throw new Error('Failed to fetch savings data from Accurate.id');
        }
    }

    /**
     * Get employee loan balances
     */
    async getEmployeeLoans(employeeId: number): Promise<AccurateLoanData> {
        try {
            // This would need to be adjusted based on actual Accurate.id API endpoints
            // Query accounts 110304, 110305, 110306, 110307 for different loan types
            const loanAccounts = ['110304', '110305', '110306', '110307'];
            let totalOutstanding = 0;
            const outstandingLoans = {
                regular: 0,
                khusus: 0,
                barang: 0,
                travel: 0,
            };

            // This is a simplified approach - actual implementation would depend on Accurate.id API
            for (let i = 0; i < loanAccounts.length; i++) {
                const response = await this.makeRequest(
                    `sp.json?name=journal_voucher_list&accountNo=${loanAccounts[i]}&employeeId=${employeeId}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const balance = data.totalBalance || 0;
                    totalOutstanding += balance;

                    // Map account to loan type
                    switch (loanAccounts[i]) {
                        case '110304':
                            outstandingLoans.regular = balance;
                            break;
                        case '110305':
                            outstandingLoans.khusus = balance;
                            break;
                        case '110306':
                            outstandingLoans.barang = balance;
                            break;
                        case '110307':
                            outstandingLoans.travel = balance;
                            break;
                    }
                }
            }

            return {
                employeeId,
                outstandingLoans,
                totalOutstanding,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error fetching employee loans:', error);
            throw new Error('Failed to fetch loan data from Accurate.id');
        }
    }

    /**
     * Create journal voucher for loan posting
     */
    async createJournalVoucher(voucherData: JournalVoucherRequest): Promise<{ success: boolean; voucherId?: string; error?: string }> {
        try {
            const response = await this.makeRequest('journal-voucher/save.do', {
                method: 'POST',
                body: JSON.stringify(voucherData),
            });

            if (!response.ok) {
                const errorData = await response.text();
                return {
                    success: false,
                    error: `Failed to create journal voucher: ${response.status} - ${errorData}`,
                };
            }

            const data = await response.json();

            if (data.s) {
                return {
                    success: true,
                    voucherId: data.id, // Adjust based on actual response format
                };
            } else {
                return {
                    success: false,
                    error: data.d || 'Unknown error from Accurate.id',
                };
            }
        } catch (error) {
            console.error('Error creating journal voucher:', error);
            return {
                success: false,
                error: 'Failed to post loan to Accurate.id',
            };
        }
    }

    /**
     * Generate journal voucher data for loan posting
     */
    generateLoanVoucherData(
        employeeId: number,
        amount: number,
        loanType: string,
        coaAccount: string,
        description: string
    ): JournalVoucherRequest {
        const today = new Date().toISOString().split('T')[0];
        const voucherNo = `LOAN-${Date.now()}`;

        return {
            transDate: today,
            description,
            journalVoucherNo: voucherNo,
            journalVoucherDetails: [
                {
                    accountNo: coaAccount, // Loan payable account
                    debit: amount,
                    credit: 0,
                    memo: `Pinjaman ${loanType} - Karyawan ${employeeId}`,
                },
                {
                    accountNo: '110101', // Bank/Cash account (adjust as needed)
                    debit: 0,
                    credit: amount,
                    memo: `Pencairan ${loanType} - Karyawan ${employeeId}`,
                },
            ],
        };
    }

    /**
     * Get COA account based on loan type
     */
    getLoanCOA(loanType: string): string {
        const coaMapping: Record<string, string> = {
            'REGULAR': '110304',
            'KHUSUS': '110305',
            'BARANG': '110306',
            'TRAVEL': '110307',
        };

        return coaMapping[loanType] || '110304'; // Default to REGULAR if not found
    }
}

// Create singleton instance
export const accurateAPI = new AccurateAPI();

// Export types for use in other modules
export type {
    AccurateEmployee,
    AccurateSavingsData,
    AccurateLoanData,
    JournalVoucherRequest,
    AccurateApiConfig,
};