import axios, { AxiosInstance } from 'axios';

export interface XeroConfig {
  tenantId: string;
  accessToken: string;
  apiVersion?: string;
}

export interface XeroInvoice {
  invoiceID: string;
  invoiceNumber: string;
  reference: string;
  invoiceStatus: string;
  lineAmountTypes: string;
  invoiceType: string;
  dateString: string;
  dueDate: string;
  contact: { contactID: string; name: string; emailAddress: string };
  lineItems: Array<{
    lineItemID: string;
    description: string;
    quantity: number;
    unitAmount: number;
    taxType: string;
    taxAmount: number;
    lineAmount: number;
    accountCode: string;
  }>;
  total: number;
  tax: number;
  amountDue: number;
  amountPaid: number;
  currencyCode: string;
}

export interface XeroBill {
  invoiceID: string;
  invoiceNumber: string;
  reference: string;
  invoiceStatus: string;
  lineAmountTypes: string;
  invoiceType: string;
  dateString: string;
  dueDate: string;
  contact: { contactID: string; name: string; emailAddress: string };
  lineItems: Array<{
    lineItemID: string;
    description: string;
    quantity: number;
    unitAmount: number;
    taxType: string;
    taxAmount: number;
    lineAmount: number;
    accountCode: string;
  }>;
  total: number;
  tax: number;
  amountDue: number;
  amountPaid: number;
  currencyCode: string;
}

export interface XeroAccount {
  accountID: string;
  code: string;
  name: string;
  type: string;
  taxType: string;
  description: string;
  enablePayments: boolean;
  showInExpensesClaims: boolean;
  status: string;
  systemAccount: string;
}

export interface XeroContact {
  contactID: string;
  contactNumber: string;
  name: string;
  emailAddress: string;
  skypeName: string;
  firstName: string;
  lastName: string;
  companyNumber: string;
  accountNumber: string;
  taxNumber: string;
  addresses: Array<{
    addressType: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    attentionTo: string;
    addressLine1: string;
    addressLine2: string;
  }>;
  phones: Array<{ phoneType: string; phoneNumber: string; phoneAreaCode: string; phoneCountryCode: string }>;
  contactStatus: string;
  hasAttachments: boolean;
}

export class XeroConnector {
  private client: AxiosInstance;
  private config: XeroConfig;

  constructor(config: XeroConfig) {
    this.config = {
      apiVersion: '2.0',
      ...config,
    };

    const baseURL = `https://api.xero.com/api.xro/${this.config.apiVersion}`;

    this.client = axios.create({
      baseURL,
      headers: {
        'xero-tenant-id': this.config.tenantId,
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all invoices
   */
  async getInvoices(where?: string, order?: string): Promise<XeroInvoice[]> {
    try {
      const params: any = {};
      if (where) params.where = where;
      if (order) params.order = order;

      const response = await this.client.get('/Invoices', { params });
      return response.data.Invoices || [];
    } catch (error) {
      console.error('Error fetching Xero invoices:', error);
      throw error;
    }
  }

  /**
   * Get all bills (vendor invoices)
   */
  async getBills(where?: string, order?: string): Promise<XeroBill[]> {
    try {
      const params: any = {};
      if (where) params.where = where;
      if (order) params.order = order;

      const response = await this.client.get('/Invoices', {
        params: {
          ...params,
          where: `${where ? where + ' AND ' : ''}Type=="ACCRECPAY"`,
        },
      });

      return response.data.Invoices || [];
    } catch (error) {
      console.error('Error fetching Xero bills:', error);
      throw error;
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<XeroAccount[]> {
    try {
      const response = await this.client.get('/Accounts');
      return response.data.Accounts || [];
    } catch (error) {
      console.error('Error fetching Xero accounts:', error);
      throw error;
    }
  }

  /**
   * Get all contacts
   */
  async getContacts(where?: string, order?: string): Promise<XeroContact[]> {
    try {
      const params: any = {};
      if (where) params.where = where;
      if (order) params.order = order;

      const response = await this.client.get('/Contacts', { params });
      return response.data.Contacts || [];
    } catch (error) {
      console.error('Error fetching Xero contacts:', error);
      throw error;
    }
  }

  /**
   * Get trial balance report
   */
  async getTrialBalance(date: string) {
    try {
      const response = await this.client.get('/Reports/TrialBalance', {
        params: { date },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Xero trial balance:', error);
      throw error;
    }
  }

  /**
   * Get profit and loss report
   */
  async getProfitAndLoss(fromDate: string, toDate: string) {
    try {
      const response = await this.client.get('/Reports/ProfitAndLoss', {
        params: {
          fromDate,
          toDate,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Xero P&L:', error);
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
