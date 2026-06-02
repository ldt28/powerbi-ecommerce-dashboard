import axios, { AxiosInstance } from 'axios';

export interface HubSpotConfig {
  accessToken: string;
  apiVersion?: string;
}

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    company?: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    createdate?: string;
    lastmodifieddate?: string;
    hubspotscore?: number;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    industry?: string;
    numberofemployees?: number;
    annualrevenue?: number;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    createdate?: string;
    lastmodifieddate?: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    dealstage?: string;
    dealtype?: string;
    amount?: number;
    closedate?: string;
    createdate?: string;
    lastmodifieddate?: string;
    hubspot_owner_id?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotTicket {
  id: string;
  properties: {
    subject?: string;
    content?: string;
    hs_ticket_priority?: string;
    hs_ticket_status?: string;
    hs_ticket_category?: string;
    createdate?: string;
    lastmodifieddate?: string;
    hubspot_owner_id?: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export class HubSpotConnector {
  private client: AxiosInstance;
  private config: HubSpotConfig;

  constructor(config: HubSpotConfig) {
    this.config = {
      apiVersion: 'v3',
      ...config,
    };

    const baseURL = `https://api.hubapi.com/crm/${this.config.apiVersion}`;

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all contacts
   */
  async getContacts(limit: number = 100, after?: string): Promise<{
    contacts: HubSpotContact[];
    nextPage?: string;
  }> {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/objects/contacts', { params });

      return {
        contacts: response.data.results,
        nextPage: response.data.paging?.next?.after,
      };
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      throw error;
    }
  }

  /**
   * Get all companies
   */
  async getCompanies(limit: number = 100, after?: string): Promise<{
    companies: HubSpotCompany[];
    nextPage?: string;
  }> {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/objects/companies', { params });

      return {
        companies: response.data.results,
        nextPage: response.data.paging?.next?.after,
      };
    } catch (error) {
      console.error('Error fetching HubSpot companies:', error);
      throw error;
    }
  }

  /**
   * Get all deals
   */
  async getDeals(limit: number = 100, after?: string): Promise<{
    deals: HubSpotDeal[];
    nextPage?: string;
  }> {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/objects/deals', { params });

      return {
        deals: response.data.results,
        nextPage: response.data.paging?.next?.after,
      };
    } catch (error) {
      console.error('Error fetching HubSpot deals:', error);
      throw error;
    }
  }

  /**
   * Get all tickets
   */
  async getTickets(limit: number = 100, after?: string): Promise<{
    tickets: HubSpotTicket[];
    nextPage?: string;
  }> {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/objects/tickets', { params });

      return {
        tickets: response.data.results,
        nextPage: response.data.paging?.next?.after,
      };
    } catch (error) {
      console.error('Error fetching HubSpot tickets:', error);
      throw error;
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      const response = await this.client.get(`/objects/contacts/${email}`, {
        params: { idProperty: 'email' },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot contact by email:', error);
      return null;
    }
  }

  /**
   * Create contact
   */
  async createContact(properties: Record<string, any>): Promise<HubSpotContact> {
    try {
      const response = await this.client.post('/objects/contacts', {
        properties,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      throw error;
    }
  }

  /**
   * Update contact
   */
  async updateContact(contactId: string, properties: Record<string, any>): Promise<HubSpotContact> {
    try {
      const response = await this.client.patch(`/objects/contacts/${contactId}`, {
        properties,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot contact:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(objectType: string, limit: number = 100) {
    try {
      const response = await this.client.get(`/objects/${objectType}`, {
        params: { limit },
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching HubSpot ${objectType} analytics:`, error);
      throw error;
    }
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const result = await this.getContacts(1);
      return !!result.contacts;
    } catch {
      return false;
    }
  }
}
