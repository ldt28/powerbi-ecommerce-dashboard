import axios, { AxiosInstance } from 'axios';

export interface SalesforceConfig {
  instanceUrl: string;
  accessToken: string;
  apiVersion?: string;
}

export interface SalesforceAccount {
  Id: string;
  Name: string;
  AccountNumber: string;
  Type: string;
  Industry: string;
  AnnualRevenue: number;
  NumberOfEmployees: number;
  Phone: string;
  Website: string;
  BillingStreet: string;
  BillingCity: string;
  BillingState: string;
  BillingPostalCode: string;
  BillingCountry: string;
  ShippingStreet: string;
  ShippingCity: string;
  ShippingState: string;
  ShippingPostalCode: string;
  ShippingCountry: string;
  Description: string;
  Rating: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceContact {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  MobilePhone: string;
  Title: string;
  Department: string;
  AccountId: string;
  MailingStreet: string;
  MailingCity: string;
  MailingState: string;
  MailingPostalCode: string;
  MailingCountry: string;
  Description: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  StageName: string;
  Amount: number;
  Probability: number;
  CloseDate: string;
  AccountId: string;
  Type: string;
  LeadSource: string;
  ForecastCategory: string;
  Description: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceTask {
  Id: string;
  Subject: string;
  Description: string;
  Status: string;
  Priority: string;
  ActivityDate: string;
  WhoId: string;
  WhatId: string;
  IsReminderSet: boolean;
  ReminderDateTime: string;
  CreatedDate: string;
}

export class SalesforceConnector {
  private client: AxiosInstance;
  private config: SalesforceConfig;

  constructor(config: SalesforceConfig) {
    this.config = {
      apiVersion: '59.0',
      ...config,
    };

    const baseURL = `${this.config.instanceUrl}/services/data/v${this.config.apiVersion}`;

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Execute SOQL query
   */
  async query<T>(soql: string): Promise<T[]> {
    try {
      const response = await this.client.get('/query', {
        params: { q: soql },
      });

      return response.data.records || [];
    } catch (error) {
      console.error('Error executing Salesforce SOQL:', error);
      throw error;
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<SalesforceAccount[]> {
    const soql = 'SELECT Id, Name, AccountNumber, Type, Industry, AnnualRevenue, NumberOfEmployees, Phone, Website, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry, Description, Rating, CreatedDate, LastModifiedDate FROM Account';
    return this.query<SalesforceAccount>(soql);
  }

  /**
   * Get all contacts
   */
  async getContacts(): Promise<SalesforceContact[]> {
    const soql = 'SELECT Id, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, AccountId, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Description, CreatedDate, LastModifiedDate FROM Contact';
    return this.query<SalesforceContact>(soql);
  }

  /**
   * Get all opportunities
   */
  async getOpportunities(): Promise<SalesforceOpportunity[]> {
    const soql = 'SELECT Id, Name, StageName, Amount, Probability, CloseDate, AccountId, Type, LeadSource, ForecastCategory, Description, CreatedDate, LastModifiedDate FROM Opportunity';
    return this.query<SalesforceOpportunity>(soql);
  }

  /**
   * Get all tasks
   */
  async getTasks(): Promise<SalesforceTask[]> {
    const soql = 'SELECT Id, Subject, Description, Status, Priority, ActivityDate, WhoId, WhatId, IsReminderSet, ReminderDateTime, CreatedDate FROM Task';
    return this.query<SalesforceTask>(soql);
  }

  /**
   * Get opportunities by account
   */
  async getOpportunitiesByAccount(accountId: string): Promise<SalesforceOpportunity[]> {
    const soql = `SELECT Id, Name, StageName, Amount, Probability, CloseDate, AccountId, Type, LeadSource, ForecastCategory, Description, CreatedDate, LastModifiedDate FROM Opportunity WHERE AccountId = '${accountId}'`;
    return this.query<SalesforceOpportunity>(soql);
  }

  /**
   * Get contacts by account
   */
  async getContactsByAccount(accountId: string): Promise<SalesforceContact[]> {
    const soql = `SELECT Id, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, AccountId, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Description, CreatedDate, LastModifiedDate FROM Contact WHERE AccountId = '${accountId}'`;
    return this.query<SalesforceContact>(soql);
  }

  /**
   * Create record
   */
  async createRecord(sobjectType: string, data: Record<string, any>): Promise<{ id: string; success: boolean }> {
    try {
      const response = await this.client.post(`/sobjects/${sobjectType}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating Salesforce ${sobjectType}:`, error);
      throw error;
    }
  }

  /**
   * Update record
   */
  async updateRecord(sobjectType: string, recordId: string, data: Record<string, any>): Promise<{ success: boolean }> {
    try {
      const response = await this.client.patch(`/sobjects/${sobjectType}/${recordId}`, data);
      return { success: response.status === 204 };
    } catch (error) {
      console.error(`Error updating Salesforce ${sobjectType}:`, error);
      throw error;
    }
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      return accounts.length >= 0;
    } catch {
      return false;
    }
  }
}
