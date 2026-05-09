export type CreateSubscriptionInput = {
  planId: string;
  currency: string;
  paymentMethod: string;
  paymentDetails: any;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type UpdateSubscriptionInput = Partial<{
  status: string;
  pesapalOrderTrackingId: string;
  pesapalMerchantReference: string;
  pesapalStatus: string;
  paymentDetails: any;
  startDate: Date;
  endDate: Date;
}>;

export type SubscriptionDTO = {
  id: string;
  providerId: string;
  planId: string;
  currency: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  pesapalOrderTrackingId: string | null;
  pesapalMerchantReference: string | null;
  pesapalStatus: string | null;
  paymentDetails: any;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};
