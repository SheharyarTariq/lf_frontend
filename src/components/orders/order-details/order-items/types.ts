export interface OrderItem {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  item: any;
  quantity: number;
  cleaningMethod: string;
  pricePerUnit: number;
  totalPrice: number;
  openItemName: string | null;
  piece: number | null;
  isApproved: boolean | null;
}

export interface ItemCategory {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  name: string;
  washingLabel: string;
}

export interface RegularItemOption {
  id: string;
  atId: string;
  name: string;
  washingLabel: string;
  categoryId: string;
  priceWashing: number | null;
  priceDryCleaning: number | null;
}

export interface OrderItemsData {
  totalItems: number;
  member: OrderItem[];
}

export interface OrderInfoForPrint {
  orderNumber?: number;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  pickupDate?: string;
  dropoffDate?: string;
}
