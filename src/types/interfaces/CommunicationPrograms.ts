import type { ActivityStatus } from "../enums/ActitvityStatusEnum";
import type { LocationType } from "../enums/LocationTypeEnum";

export interface CommunicationPrograms {
  programID: string;
  name: string;
  description: string;
  imgUrl: string | null;
  date: string; 
  startTime: string; 
  endTime: string;   
  speaker: string | null;
  speakerImageUrl: string | null;
  status: ActivityStatus;
  locationType: LocationType;
  location: string;
}

export interface ProgramParticipation {
  userID: string;
  programID: string;
  joinTime: string | null;
  status: ActivityStatus;
}

