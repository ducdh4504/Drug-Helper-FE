import type { LevelTarget } from "../enums/LevelTargetEnum";
import type { PaperDraftEnum } from "../enums/PaperDraftEnum";

export interface Blogs {
  blogID: string;
  userID: string;
  title: string | null;
  imgUrl: string | null;
  content: string | null;
  publishDate: string | Date;
  status: PaperDraftEnum;
  resultLevel?: LevelTarget;
}
