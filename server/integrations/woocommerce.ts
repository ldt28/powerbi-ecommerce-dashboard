import axios, { AxiosInstance } from 'axios';

export interface WooCommerceConfig {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  featured: boolean;
  catalogVisibility: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  purchasable: boolean;
  totalSales: number;
  virtual: boolean;
  downloadable: boolean;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
  images: Array<{ id: number; src: string; alt: string }>;
  attributes: Array<{ id: number; name: string; options: string[] }>;
  defaultAttributes: Array<{ id: number; name: string; option: string }>;
  variations: number[];
  stockQuantity: number | null;
  stockStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface WooOrder {
  id: number;
  orderNumber: string;
  status: string;
  currency: string;
  dateCreated: string;
  dateModified: string;
  discountTotal: string;
  discountTax: string;
  shippingTotal: string;
  shippingTax: string;
  cartTax: string;
  total: string;
  totalTax: string;
  paymentMethod: string;
  paymentMethodTitle: string;
  transactionId: string;
  customerIpAddress: string;
  customerUserAgent: string;
  customerId: number;
  customerNote: string;
  billing: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  lineItems: Array<{
    id: number;
    name: string;
    productId: number;
    variationId: number;
    quantity: number;
    taxClass: string;
    subtotal: string;
    subtotalTax: string;
    total: string;
    totalTax: string;
    price: string;
  }>;
  taxLines: Array<{ id: number; rateCode: string; rateId: number; label: string; compound: boolean; taxTotal: string; shippingTaxTotal: string }>;
  shippingLines: Array<{ id: number; methodTitle: string; methodId: string; instanceId: string; total: string; totalTax: string }>;
}

export interface WooCustomer {
  id: number;
  dateCreated: string;
  dateModified: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  username: string;
  billing: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  isPayingCustomer: boolean;
  avatarUrl: string;
}

export class WooCommerceConnector {
  private client: AxiosInstance;

  constructor(config: WooCommerceConfig) {
    const baseURL = `${config.siteUrl}/wp-json/wc/v3`;

    this.client = axios.create({
      baseURL,
      auth: {
        username: config.consumerKey,
        password: config.consumerSecret,
      },
    });
  }

  /**
   * Get all products
   */
  async getProducts(page: number = 1, perPage: number = 100): Promise<{
    products: WooProduct[];
    total: number;
    totalPages: number;
  }> {
    try {
      const response = await this.client.get('/products', {
        params: { page, per_page: perPage },
      });

      return {
        products: response.data,
        total: parseInt(response.headers['x-wp-total'] || '0'),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '0'),
      };
    } catch (error) {
      console.error('Error fetching WooCommerce products:', error);
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(page: number = 1, perPage: number = 100): Promise<{
    orders: WooOrder[];
    total: number;
    totalPages: number;
  }> {
    try {
      const response = await this.client.get('/orders', {
        params: { page, per_page: perPage },
      });

      return {
        orders: response.data,
        total: parseInt(response.headers['x-wp-total'] || '0'),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '0'),
      };
    } catch (error) {
      console.error('Error fetching WooCommerce orders:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   */
  async getCustomers(page: number = 1, perPage: number = 100): Promise<{
    customers: WooCustomer[];
    total: number;
    totalPages: number;
  }> {
    try {
      const response = await this.client.get('/customers', {
        params: { page, per_page: perPage },
      });

      return {
        customers: response.data,
        total: parseInt(response.headers['x-wp-total'] || '0'),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '0'),
      };
    } catch (error) {
      console.error('Error fetching WooCommerce customers:', error);
      throw error;
    }
  }

  /**
   * Get store settings
   */
  async getStoreSettings() {
    try {
      const response = await this.client.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching WooCommerce settings:', error);
      throw error;
    }
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.getStoreSettings();
      return true;
    } catch {
      return false;
    }
  }
}
