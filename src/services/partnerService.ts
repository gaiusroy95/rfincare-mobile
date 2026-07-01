import { apiClient } from '@/src/api/apiClient';

export type PartnerRegistrationPayload = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  panNumber: string;
  bankName: string;
  accountNumber: string;
  branchAddress: string;
  ifscCode: string;
  photo: { uri: string; name: string; mimeType?: string };
  panCard: { uri: string; name: string; mimeType?: string };
  cancelledCheque: { uri: string; name: string; mimeType?: string };
  addressProof: { uri: string; name: string; mimeType?: string };
};

function appendFile(fd: FormData, key: string, file: { uri: string; name: string; mimeType?: string }) {
  fd.append(key, {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as unknown as Blob);
}

export const partnerService = {
  async submitRegistration(payload: PartnerRegistrationPayload) {
    const fd = new FormData();
    fd.append('fullName', payload.fullName);
    fd.append('email', payload.email.toLowerCase());
    fd.append('phone', payload.phone);
    fd.append('addressLine1', payload.addressLine1);
    if (payload.addressLine2) fd.append('addressLine2', payload.addressLine2);
    fd.append('city', payload.city);
    fd.append('state', payload.state);
    fd.append('pinCode', payload.pinCode);
    fd.append('panNumber', payload.panNumber.toUpperCase());
    fd.append('bankName', payload.bankName);
    fd.append('accountNumber', payload.accountNumber);
    fd.append('branchAddress', payload.branchAddress);
    fd.append('ifscCode', payload.ifscCode.toUpperCase());
    appendFile(fd, 'photo', payload.photo);
    appendFile(fd, 'panCard', payload.panCard);
    appendFile(fd, 'cancelledCheque', payload.cancelledCheque);
    appendFile(fd, 'addressProof', payload.addressProof);

    const res = await apiClient.post('/partners/register', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
};
