import type { ActivityStatus } from "../enums/ActitvityStatusEnum";

export interface Certificates {
  certificateID: string;
  userID: string;
  imgUrl: string;
  certificateName: string | null;
  dateAcquired: string | null;
  status: ActivityStatus;
}
