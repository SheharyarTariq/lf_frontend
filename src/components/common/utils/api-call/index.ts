import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import toast from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiCallParams {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  status: number | null;
  message: string;
}

export default async function apiCall<T = unknown>({
  endpoint,
  method,
  data,
  headers,
  showSuccessToast = false,
  successMessage,
}: ApiCallParams): Promise<ApiResponse<T>> {
  try {
    const axiosConfig: AxiosRequestConfig = {
      url: `${BASE_URL}${endpoint}`,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      axiosConfig.data = data;
    }

    if (data && method === "GET") {
      axiosConfig.params = data;
    }

    const response: AxiosResponse<T> = await axios(axiosConfig);

    if (showSuccessToast) {
      toast.success(successMessage || "Request successful");
    }

    return {
      success: true,
      data: response.data,
      status: response.status,
      message: successMessage || "Request successful",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail;

      let errorMessage: string;

      switch (status) {
        case 400:
          errorMessage = backendMessage || "Invalid request. Please check your input.";
          break;
        case 401:
          errorMessage = backendMessage || "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = backendMessage || "You don't have permission to perform this action.";
          break;
        case 404:
          errorMessage = backendMessage || "The requested resource was not found.";
          break;
        case 409:
          errorMessage = backendMessage || "This resource already exists.";
          break;
        case 422:
          errorMessage = backendMessage || "Validation failed. Please check your input.";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later.";
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = "Server is currently unavailable. Please try again later.";
          break;
        default:
          errorMessage = backendMessage || "Something went wrong. Please try again.";
      }

      toast.error(errorMessage);

      return {
        success: false,
        data: error.response?.data || null,
        status: status || null,
        message: errorMessage,
      };
    }

    if (error instanceof Error) {
      if (error.message === "Network Error") {
        toast.error("Please check your network and try again.");
        return {
          success: false,
          data: null,
          status: null,
          message: "Please check your network and try again.",
        };
      }

      toast.error(error.message || "An unexpected error occurred.");
      return {
        success: false,
        data: null,
        status: null,
        message: error.message || "An unexpected error occurred.",
      };
    }

    toast.error("An unexpected error occurred. Please try again.");
    return {
      success: false,
      data: null,
      status: null,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
