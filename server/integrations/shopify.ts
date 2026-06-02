import axios, { AxiosInstance } from 'axios';

export interface ShopifyConfig {
  shopName: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  tags: string[];
  status: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    sku: string;
    barcode: string;
    quantity: number;
  }>;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  cancelledAt: string | null;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  totalShippingPrice: string;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  lineItems: Array<{
    id: string;
    productId: string;
    variantId: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    totalSpent: string;
    orderCount: number;
  };
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  totalSpent: string;
  orderCount: number;
  state: string;
  tags: string[];
}

export class ShopifyConnector {
  private client: AxiosInstance;
  private config: ShopifyConfig;

  constructor(config: ShopifyConfig) {
    this.config = {
      apiVersion: '2024-01',
      ...config,
    };

    const baseURL = `https://${this.config.shopName}.myshopify.com/admin/api/${this.config.apiVersion}`;

    this.client = axios.create({
      baseURL,
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all products
   */
  async getProducts(limit: number = 250, cursor?: string): Promise<{
    products: ShopifyProduct[];
    nextCursor?: string;
  }> {
    try {
      const query = `
        query {
          products(first: ${limit}${cursor ? `, after: "${cursor}"` : ''}) {
            edges {
              node {
                id
                title
                handle
                vendor
                productType
                createdAt
                updatedAt
                publishedAt
                tags
                status
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      barcode
                      quantityAvailable
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const response = await this.client.post('/graphql.json', { query });
      const data = response.data.data.products;

      return {
        products: data.edges.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          vendor: edge.node.vendor,
          productType: edge.node.productType,
          createdAt: edge.node.createdAt,
          updatedAt: edge.node.updatedAt,
          publishedAt: edge.node.publishedAt,
          tags: edge.node.tags,
          status: edge.node.status,
          variants: edge.node.variants.edges.map((v: any) => ({
            id: v.node.id,
            title: v.node.title,
            price: v.node.price,
            sku: v.node.sku,
            barcode: v.node.barcode,
            quantity: v.node.quantityAvailable,
          })),
        })),
        nextCursor: data.pageInfo.hasNextPage ? data.pageInfo.endCursor : undefined,
      };
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      throw error;
    }
  }

  /**
   * Get all orders
   */
  async getOrders(limit: number = 250, cursor?: string): Promise<{
    orders: ShopifyOrder[];
    nextCursor?: string;
  }> {
    try {
      const query = `
        query {
          orders(first: ${limit}${cursor ? `, after: "${cursor}"` : ''}) {
            edges {
              node {
                id
                orderNumber
                email
                createdAt
                updatedAt
                closedAt
                cancelledAt
                totalPriceSet { shopMoney { amount } }
                subtotalPriceSet { shopMoney { amount } }
                totalTaxSet { shopMoney { amount } }
                totalShippingPriceSet { shopMoney { amount } }
                currencyCode
                financialStatus
                fulfillmentStatus
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      productId
                      variantId
                      title
                      quantity
                      originalUnitPriceSet { shopMoney { amount } }
                    }
                  }
                }
                customer {
                  id
                  email
                  firstName
                  lastName
                  totalSpent
                  numberOfOrders
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const response = await this.client.post('/graphql.json', { query });
      const data = response.data.data.orders;

      return {
        orders: data.edges.map((edge: any) => ({
          id: edge.node.id,
          orderNumber: edge.node.orderNumber,
          email: edge.node.email,
          createdAt: edge.node.createdAt,
          updatedAt: edge.node.updatedAt,
          closedAt: edge.node.closedAt,
          cancelledAt: edge.node.cancelledAt,
          totalPrice: edge.node.totalPriceSet.shopMoney.amount,
          subtotalPrice: edge.node.subtotalPriceSet.shopMoney.amount,
          totalTax: edge.node.totalTaxSet.shopMoney.amount,
          totalShippingPrice: edge.node.totalShippingPriceSet.shopMoney.amount,
          currency: edge.node.currencyCode,
          financialStatus: edge.node.financialStatus,
          fulfillmentStatus: edge.node.fulfillmentStatus,
          lineItems: edge.node.lineItems.edges.map((li: any) => ({
            id: li.node.id,
            productId: li.node.productId,
            variantId: li.node.variantId,
            title: li.node.title,
            quantity: li.node.quantity,
            price: li.node.originalUnitPriceSet.shopMoney.amount,
          })),
          customer: {
            id: edge.node.customer.id,
            email: edge.node.customer.email,
            firstName: edge.node.customer.firstName,
            lastName: edge.node.customer.lastName,
            totalSpent: edge.node.customer.totalSpent,
            orderCount: edge.node.customer.numberOfOrders,
          },
        })),
        nextCursor: data.pageInfo.hasNextPage ? data.pageInfo.endCursor : undefined,
      };
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   */
  async getCustomers(limit: number = 250, cursor?: string): Promise<{
    customers: ShopifyCustomer[];
    nextCursor?: string;
  }> {
    try {
      const query = `
        query {
          customers(first: ${limit}${cursor ? `, after: "${cursor}"` : ''}) {
            edges {
              node {
                id
                email
                firstName
                lastName
                phone
                createdAt
                updatedAt
                totalSpent
                numberOfOrders
                state
                tags
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const response = await this.client.post('/graphql.json', { query });
      const data = response.data.data.customers;

      return {
        customers: data.edges.map((edge: any) => ({
          id: edge.node.id,
          email: edge.node.email,
          firstName: edge.node.firstName,
          lastName: edge.node.lastName,
          phone: edge.node.phone,
          createdAt: edge.node.createdAt,
          updatedAt: edge.node.updatedAt,
          totalSpent: edge.node.totalSpent,
          orderCount: edge.node.numberOfOrders,
          state: edge.node.state,
          tags: edge.node.tags,
        })),
        nextCursor: data.pageInfo.hasNextPage ? data.pageInfo.endCursor : undefined,
      };
    } catch (error) {
      console.error('Error fetching Shopify customers:', error);
      throw error;
    }
  }

  /**
   * Get store info
   */
  async getStoreInfo() {
    try {
      const query = `
        query {
          shop {
            name
            email
                            myshopifyDomain
            currencyCode
            timezone
            plan {
              displayName
            }
          }
        }
      `;

      const response = await this.client.post('/graphql.json', { query });
      return response.data.data.shop;
    } catch (error) {
      console.error('Error fetching Shopify store info:', error);
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
