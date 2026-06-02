import axios, { AxiosInstance } from 'axios';

// ============ FedEx ============
export interface FedExConfig {
  accountNumber: string;
  meterNumber: string;
  key: string;
  password: string;
  environment?: 'production' | 'test';
}

export interface FedExShipment {
  trackingNumber: string;
  shipDate: string;
  weight: number;
  weightUnit: string;
  origin: { city: string; state: string; zip: string; country: string };
  destination: { city: string; state: string; zip: string; country: string };
  service: string;
  status: string;
  estimatedDelivery: string;
}

export interface FedExTracking {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  shipDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  events: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export class FedExConnector {
  private client: AxiosInstance;
  private config: FedExConfig;

  constructor(config: FedExConfig) {
    this.config = {
      environment: 'production',
      ...config,
    };

    const baseURL =
      this.config.environment === 'test'
        ? 'https://apis-sandbox.fedex.com'
        : 'https://apis.fedex.com';

    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Get authentication token
   */
  private async getToken(): Promise<string> {
    try {
      const response = await this.client.post('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.config.key,
        client_secret: this.config.password,
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting FedEx token:', error);
      throw error;
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber: string): Promise<FedExTracking> {
    try {
      const token = await this.getToken();

      const response = await this.client.post(
        '/track/v1/trackingnumbers',
        {
          includeDetailedScans: true,
          trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const tracking = response.data.output.completeTrackResults[0].trackResults[0];

      return {
        trackingNumber,
        status: tracking.latestStatusDetail?.statusType || 'UNKNOWN',
        statusDescription: tracking.latestStatusDetail?.description || '',
        shipDate: tracking.shipTimestamp,
        estimatedDelivery: tracking.estimatedDeliveryTimestamp,
        actualDelivery: tracking.actualDeliveryTimestamp,
        events: tracking.scanEvents?.map((event: any) => ({
          timestamp: event.eventTimestamp,
          status: event.eventType,
          location: `${event.eventLocation?.city}, ${event.eventLocation?.state}`,
          description: event.eventDescription,
        })) || [],
      };
    } catch (error) {
      console.error('Error tracking FedEx shipment:', error);
      throw error;
    }
  }
}

// ============ UPS ============
export interface UPSConfig {
  accountNumber: string;
  username: string;
  password: string;
  accessKey: string;
  environment?: 'production' | 'test';
}

export interface UPSTracking {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  shipDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  weightUnit: string;
  events: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export class UPSConnector {
  private client: AxiosInstance;
  private config: UPSConfig;

  constructor(config: UPSConfig) {
    this.config = {
      environment: 'production',
      ...config,
    };

    const baseURL =
      this.config.environment === 'test'
        ? 'https://onlinetools.ups.com/track/v1/details/'
        : 'https://onlinetools.ups.com/track/v1/details/';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'AccessLicenseNumber': this.config.accessKey,
        'Username': this.config.username,
        'Password': this.config.password,
      },
    });
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber: string): Promise<UPSTracking> {
    try {
      const response = await this.client.get(`${trackingNumber}`, {
        params: { locale: 'en_US' },
      });

      const shipment = response.data.shipments[0];
      const latestStatus = shipment.statusHistory[0];

      return {
        trackingNumber,
        status: latestStatus.status?.statusType || 'UNKNOWN',
        statusDescription: latestStatus.status?.description || '',
        shipDate: shipment.shipmentProgressStatuses[0].timestamp,
        estimatedDelivery: shipment.deliveryInformation?.estimatedArrivalDate || '',
        actualDelivery: shipment.deliveryInformation?.actualDeliveryDate,
        weight: shipment.packageWeight?.weight || 0,
        weightUnit: shipment.packageWeight?.unitOfMeasurement?.code || 'LBS',
        events: shipment.statusHistory.map((event: any) => ({
          timestamp: event.timestamp,
          status: event.status?.statusType || '',
          location: `${event.location?.address?.city}, ${event.location?.address?.stateProvince}`,
          description: event.status?.description || '',
        })),
      };
    } catch (error) {
      console.error('Error tracking UPS shipment:', error);
      throw error;
    }
  }
}

// ============ DHL ============
export interface DHLConfig {
  consumerId: string;
  consumerSecret: string;
  environment?: 'production' | 'test';
}

export interface DHLTracking {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  shipDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  weightUnit: string;
  events: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export class DHLConnector {
  private client: AxiosInstance;
  private config: DHLConfig;

  constructor(config: DHLConfig) {
    this.config = {
      environment: 'production',
      ...config,
    };

    const baseURL =
      this.config.environment === 'test'
        ? 'https://apitest.dhl.com'
        : 'https://api.dhl.com';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'DHL-API-Key': this.config.consumerId,
      },
    });
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber: string): Promise<DHLTracking> {
    try {
      const response = await this.client.get(`/track/shipments`, {
        params: {
          trackingNumber,
          'Accept-Language': 'en',
        },
      });

      const shipment = response.data.shipments[0];
      const latestEvent = shipment.events[0];

      return {
        trackingNumber,
        status: latestEvent.statusCode || 'UNKNOWN',
        statusDescription: latestEvent.description || '',
        shipDate: shipment.shipmentInfo?.shipmentDate || '',
        estimatedDelivery: shipment.estimatedDeliveryDate || '',
        actualDelivery: shipment.deliveryDetails?.actualDeliveryDate,
        weight: shipment.weight?.value || 0,
        weightUnit: shipment.weight?.unitText || 'kg',
        events: shipment.events.map((event: any) => ({
          timestamp: event.timestamp,
          status: event.statusCode,
          location: `${event.location?.address?.cityName}, ${event.location?.address?.countryCode}`,
          description: event.description,
        })),
      };
    } catch (error) {
      console.error('Error tracking DHL shipment:', error);
      throw error;
    }
  }
}
