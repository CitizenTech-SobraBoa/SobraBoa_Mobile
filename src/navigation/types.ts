export type AuthStackParams = { Login: undefined; Register: undefined };
export type RootStackParams = {
  Main: undefined;
  Details: { id: number; owned: boolean };
  Create: undefined;
  Edit: { id: number };
  Pickup: undefined;
  About: undefined;
};
export type TabParams = {
  Admin: undefined;
  Home: undefined;
  Donations: undefined;
  Explore: undefined;
  Reservations: undefined;
  Chat: undefined;
  Account: undefined;
};
