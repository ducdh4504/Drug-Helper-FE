import { UserRole } from "../enums/UserRoleEnum"

export interface Users {
  userID: string;
  userName: string;
  password: string;
  email: string;
  imgUrl: string | null;
  fullName: string | null;
  dateOfBirth: string | null;
  address: string | null;
  phone: string | null;
  status: number; // 0 hoặc 1
  role: UserRole;
}

export interface AgeGroupStat {
  ageGroup: string;
  count: number;
  percentage: number;
}



