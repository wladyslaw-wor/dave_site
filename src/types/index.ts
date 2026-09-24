import type {
  ContentModel,
  LinkModel,
  MenuItemModel,
  TourDateModel,
} from "@/generated/prisma/models";

export type Content = ContentModel;
export type Link = LinkModel;
export type MenuItem = MenuItemModel;
export type TourDate = TourDateModel;

export type SiteData = {
  content: Content;
  links: Link[];
  menu: MenuItem[];
  dates: TourDate[];
};

export type FullState = SiteData & {
  album: import("@/lib/album").AlbumData;
  clicks: Record<string, number>;
};

export type ContentPatch = Partial<Omit<Content, "id" | "updatedAt">>;
