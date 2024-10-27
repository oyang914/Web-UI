export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  country?: string;
  city?: string;
  timezone?: string;
  age?: number;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  avatarUrl?: string;
}
