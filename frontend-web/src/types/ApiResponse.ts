// interface ApiData {
//   username?: string;
//   accessToken?: string;
//   users?: [string];
// }

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    username?: string;
    accessToken?: string;
    users?: string[];
  };
}
