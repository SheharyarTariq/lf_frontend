export const routes = {
  ui: {
    indexRoute: "/",
    signIn: "/auth/sign-in",
    areas: "/area",
    category: "/category",
    orders: "/orders",
    users: "/users",
    areaDetails: (id: string | number) => `area/${id}`,
  },

  api: {
    getArea: 'areas',
    searchArea: 'areas?name=ashtead',
    editArea: (id: string | number) => `areas/${id}`,
    getAreaSlots: (id: string | number) => `areas/${id}/slots`,
    markSlotActive: (id: string) => `slots/${id}/mark-as-active`,
    markSlotInactive: (id: string) => `slots/${id}/mark-as-inactive`,
    createSlot: "slots",
    updateSlot: (id: string) => `slots/${id}`,
    login: "login-check",
    getPostcodes: (id: string) => `areas/${id}/postcodes`,
    createPostcode: "postcodes",
    markPostcodeActive: (id: string) => `postcodes/${id}/mark-as-active`,
    markPostcodeInactive: (id: string) => `postcodes/${id}/mark-as-inactive`,

  },
};
