export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "asset" | "liability";
  is_active: boolean;
  created_at: string;
}
