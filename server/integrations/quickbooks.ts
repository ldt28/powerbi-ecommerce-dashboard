import axios, { AxiosInstance } from 'axios';

export interface QuickBooksConfig {
  realmId: string;
  accessToken: string;
  apiVersion?: string;
}

export interface QBInvoice {
  id: string;
  docNumber: string;
  txnDate: string;
  dueDate: string;
  customerRef: { value: string; name: string };
  lineItems: Array<{
    id: string;
    lineNum: number;
    description: string;
    amount: number;
    detailType: string;
    itemRef?: { value: string; name: string };
    quantity?: number;
    unitPrice?: number;
  }>;
  totalAmt: number;
  balance: number;
  docStatus: string;
  txnTaxDetail?: {
    totalTax: number;
    txnTaxLine: Array<{ detailType: string; taxLineDetail: { taxRateRef: { value: string } }; amount: number }>;
  };
}

export interface QBBill {
  id: string;
  docNumber: string;
  txnDate: string;
  dueDate: string;
  vendorRef: { value: string; name: string };
  lineItems: Array<{
    id: string;
    lineNum: number;
    description: string;
    amount: number;
    detailType: string;
    accountRef?: { value: string; name: string };
  }>;
  totalAmt: number;
  balance: number;
  docStatus: string;
}

export interface QBJournalEntry {
  id: string;
  docNumber: string;
  txnDate: string;
  line: Array<{
    id: string;
    lineNum: number;
    description: string;
    amount: number;
    detailType: string;
    journalEntryLineDetail: {
      postingType: string;
      accountRef: { value: string; name: string };
      classRef?: { value: string; name: string };
      departmentRef?: { value: string; name: string };
    };
  }>;
  totalAmt: number;
  txnTaxDetail?: { totalTax: number };
}

export interface QBAccount {
  id: string;
  name: string;
  type: string;
  subType: string;
  active: boolean;
  currentBalance: number;
  description: string;
}

export class QuickBooksConnector {
  private client: AxiosInstance;
  private config: QuickBooksConfig;

  constructor(config: QuickBooksConfig) {
    this.config = {
      apiVersion: 'v2',
      ...config,
    };

    const baseURL = `https://quickbooks.api.intuit.com/v2/company/${this.config.realmId}`;

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all invoices
   */
  async getInvoices(limit: number = 1000): Promise<QBInvoice[]> {
    try {
      const query = `SELECT * FROM Invoice MAXRESULTS ${limit}`;
      const response = await this.client.get('/query', {
        params: { query },
      });

      return response.data.QueryResponse.Invoice || [];
    } catch (error) {
      console.error('Error fetching QuickBooks invoices:', error);
      throw error;
    }
  }

  /**
   * Get all bills
   */
  async getBills(limit: number = 1000): Promise<QBBill[]> {
    try {
      const query = `SELECT * FROM Bill MAXRESULTS ${limit}`;
      const response = await this.client.get('/query', {
        params: { query },
      });

      return response.data.QueryResponse.Bill || [];
    } catch (error) {
      console.error('Error fetching QuickBooks bills:', error);
      throw error;
    }
  }

  /**
   * Get all journal entries
   */
  async getJournalEntries(limit: number = 1000): Promise<QBJournalEntry[]> {
    try {
      const query = `SELECT * FROM JournalEntry MAXRESULTS ${limit}`;
      const response = await this.client.get('/query', {
        params: { query },
      });

      return response.data.QueryResponse.JournalEntry || [];
    } catch (error) {
      console.error('Error fetching QuickBooks journal entries:', error);
      throw error;
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<QBAccount[]> {
    try {
      const query = `SELECT * FROM Account`;
      const response = await this.client.get('/query', {
        params: { query },
      });

      return response.data.QueryResponse.Account || [];
    } catch (error) {
      console.error('Error fetching QuickBooks accounts:', error);
      throw error;
    }
  }

  /**
   * Get profit and loss report
   */
  async getProfitAndLossReport(startDate: string, endDate: string) {
    try {
      const response = await this.client.get('/reports/ProfitAndLoss', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching QuickBooks P&L report:', error);
      throw error;
    }
  }

  /**
   * Get balance sheet report
   */
  async getBalanceSheetReport(asOfDate: string) {
    try {
      const response = await this.client.get('/reports/BalanceSheet', {
        params: { as_of_date: asOfDate },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching QuickBooks balance sheet:', error);
      throw error;
    }
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.getAccounts();
      return true;
    } catch {
      return false;
    }
  }
}
