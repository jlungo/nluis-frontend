import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface CCROLookupRequest {
  nidaNumber: string;
  phoneNumber: string;
}

interface CCROVerifyOTPRequest {
  otp: string;
  requestId: string;
}

interface CCROLookupResponse {
  requestId: string;
  message: string;
}

interface CCROVerifyOTPResponse {
  success: boolean;
  message: string;
  ccroData?: any; // Replace with your CCRO data type
}

export const useCCROLookupQuery = () => {
  return useMutation<CCROLookupResponse, Error, CCROLookupRequest>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/ccro/lookup/', data);
      return response.data;
    },
  });
};

export const useVerifyOTPQuery = () => {
  return useMutation<CCROVerifyOTPResponse, Error, CCROVerifyOTPRequest>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/ccro/verify-otp/', data);
      return response.data;
    },
  });
};

export const useResendOTPQuery = () => {
  return useMutation<CCROLookupResponse, Error, { requestId: string }>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/ccro/resend-otp/', data);
      return response.data;
    },
  });
};