export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

  export interface Database {
    public: {
      Tables: {
        logins: {
          Row: {
            userID: number;
            username: string;
            password: string;
          };
          Insert: {
            userID: number;
            username: string;
            password: string;
          };
          Update: {
            userID?: number;
            username?: string;
            password?: string;
          };
          Relationships: [{
            foreignKeyName: "userID_fkey";
            columns: ["userID"];
            referencedRelation: "results";
            referencedColumns: ["userID"];
          }];
        };
        results: {
          Row: {
            userID: number;
            gameID: number;
            result: number;
          };
          Insert: {
            userID: number;
            gameID: number;
            result: number;
          };
          Update: {
            gameID?: number;
            result?: number;
          };
          Relationships: [];
        };
      };
      Views: {
        [_ in never]: never;
      };
      Functions: {
        [_ in never]: never;
      };
      Enums: {
        [_ in never]: never;
      };
      CompositeTypes: {
        [_ in never]: never;
      };
    };
  }