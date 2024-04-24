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
            firstName: string;
          };
          Insert: {
            userID: number;
            username: string;
            password: string;
            firstName?: string;
          };
          Update: {
            userID?: number;
            username?: string;
            password?: string;
            firstName?: string;
          };
          Relationships: [{
            foreignKeyName: "userID_results_fkey";
            columns: ["userID"];
            referencedRelation: "results";
            referencedColumns: ["userID"];
          },
          {
            foreignKeyName: "userID_lessons_fkey";
            columns: ["userID"];
            referencedRelation: "lessons";
            referencedColumns:["userID"];
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
        lessons: {
          Row: {
            userID: number;
            completedLessons: number[];
          };
          Insert: {
            userID: number;
            completedLessons?: number[];
          };
          Update: {
            completedLessons?: number[];
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