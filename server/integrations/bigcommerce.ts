import axios, { AxiosInstance } from 'axios';

export interface BigCommerceConfig {
  storeHash: string;
  accessToken: string;
  apiVersion?: string;
}

export interface BigCommerceProduct {
  id: number;
  sku: string;
  name: string;
  type: string;
  description: string;
  weight: number;
  width: number;
  depth: number;
  height: number;
  price: number;
  costPrice: number;
  retailPrice: number;
  salePrice: number;
  taxClassId: number;
  productTaxCode: string;
  categories: number[];
  brandId: number;
  optionSetId: number;
  optionSetDisplay: string;
  weight_unit: string;
  dimension_unit: string;
  images: Array<{ id: number; url_zoom: string; url_standard: string; url_thumbnail: string; description: string }>;
  customFields: Array<{ id: number; name: string; value: string }>;
  bulkPricingRules: Array<{ id: number; quantity_min: number; quantity_max: number; type: string; amount: number }>;
  variants: number[];
  inventory: {
    count: number;
    reservedCount: number;
    availableCount: number;
  };
  isVisible: boolean;
  isFeatured: boolean;
  dateCreated: string;
  dateModified: string;
}

export interface BigCommerceOrder {
  id: number;
  customerId: number;
  dateCreated: string;
  dateModified: string;
  dateShipped: string | null;
  statusId: number;
  status: string;
  subtotalExTax: number;
  subtotalIncTax: number;
  subtotalTax: number;
  totalExTax: number;
  totalIncTax: number;
  totalTax: number;
  itemsTotal: number;
  itemsShipped: number;
  paymentMethod: string;
  paymentProviderId: string;
  shippingCostExTax: number;
  shippingCostIncTax: number;
  shippingCostTax: number;
  handlingCostExTax: number;
  handlingCostIncTax: number;
  handlingCostTax: number;
  discountAmount: number;
  giftCertificateAmount: number;
  currencyCode: string;
  orderId: number;
  products: Array<{
    id: number;
    productId: number;
    variantId: number;
    orderProductId: number;
    name: string;
    sku: string;
    type: string;
    quantity: number;
    quantityShipped: number;
    price: number;
    priceExTax: number;
    priceIncTax: number;
    priceTax: number;
    weight: number;
  }>;
  billingAddress: {
    firstName: string;
    lastName: string;
    company: string;
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    countryIso2: string;
    phone: string;
    email: string;
  };
  shippingAddresses: Array<{
    id: number;
    firstName: string;
    lastName: string;
    company: string;
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    countryIso2: string;
    phone: string;
    email: string;
  }>;
}

export interface BigCommerceCustomer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  dateCreated: string;
  dateModified: string;
  storeCredit: number;
  customerGroupId: number;
  notes: string;
  taxExemptCategory: string;
  authentication: {
    forcePasswordReset: boolean;
  };
  addresses: Array<{
    id: number;
    firstName: string;
    lastName: string;
    company: string;
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    countryIso2: string;
    phone: string;
    addressType: string;
  }>;
}

export class BigCommerceConnector {
  private client: AxiosInstance;
  private config: BigCommerceConfig;

  constructor(config: BigCommerceConfig) {
    this.config = {
      apiVersion: 'v3',
      ...config,
    };

    const baseURL = `https://api.bigcommerce.com/stores/${this.config.storeHash}/${this.config.apiVersion}`;

    this.client = axios.create({
      baseURL,
      headers: {
        'X-Auth-Token': this.config.accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all products
   */
  async getProducts(page: number = 1, limit: number = 250): Promise<{
    products: BigCommerceProduct[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await this.client.get('/catalog/products', {
        params: { page, limit },
      });

      return {
        products: response.data.data,
        total: response.data.meta.pagination.total,
        pages: response.data.meta.pagination.total_pages,
      };
    } catch (error) {
      console.error('Error fetching BigCommerce products:', error);
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(page: number = 1, limit: number = 250): Promise<{
    orders: BigCommerceOrder[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await this.client.get('/orders', {
        params: { page, limit },
      });

      return {
        orders: response.data.data,
        total: response.data.meta.pagination.total,
        pages: response.data.meta.pagination.total_pages,
      };
    } catch (error) {
      console.error('Error fetching BigCommerce orders:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   */
  async getCustomers(page: number = 1, limit: number = 250): Promise<{
    customers: BigCommerceCustomer[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await this.client.get('/customers', {
        params: { page, limit },
      });

      return {
        customers: response.data.data,
        total: response.data.meta.pagination.total,
        pages: response.data.meta.pagination.total_pages,
      };
    } catch (error) {
      console.error('Error fetching BigCommerce customers:', error);
      throw error;
    }
  }

  /**
   * Get store info
   */
  async getStoreInfo() {
    try {
      const response = await this.client.get('/store');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching BigCommerce store info:', error);
      throw error;
    }
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.getStoreInfo();
      return true;
    } catch {
      return false;
    }
  }
}
