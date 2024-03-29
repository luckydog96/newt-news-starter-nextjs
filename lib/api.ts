import { Content, createClient } from "newt-client-js";
import { Article } from "../types/article";

const client = createClient({
  spaceUid: process.env.NEXT_PUBLIC_NEWT_SPACE_UID,
  token: process.env.NEXT_PUBLIC_NEWT_API_TOKEN,
  apiType: process.env.NEXT_PUBLIC_NEWT_API_TYPE as "cdn" | "api",
});

export const fetchApp = async () => {
  const app = await client.getApp({
    appUid: process.env.NEXT_PUBLIC_NEWT_APP_UID,
  });
  return app;
};

export const fetchArticles = async (options?: {
  query?: Record<string, any>;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { query, search, page, limit } = options || {};
  const _query = {
    ...(query || {}),
  };
  if (search) {
    _query.or = [
      {
        title: {
          match: search,
        },
      },
      {
        body: {
          match: search,
        },
      },
    ];
  }
  const _page = page || 1;
  const _limit = limit || Number(process.env.NEXT_PUBLIC_PAGE_LIMIT) || 10;
  const _skip = (_page - 1) * _limit;

  const { items, total } = await client.getContents<Content & Article>({
    appUid: process.env.NEXT_PUBLIC_NEWT_APP_UID,
    modelUid: process.env.NEXT_PUBLIC_NEWT_ARTICLE_MODEL_UID,
    query: {
      depth: 2,
      limit: _limit,
      skip: _skip,
      ..._query,
    },
  });
  return {
    articles: items,
    total,
  };
};

export const getPages = async () => {
  const { total } = await fetchArticles();
  const pages = Array(
    Math.ceil(total / Number(process.env.NEXT_PUBLIC_PAGE_LIMIT) || 10)
  )
    .fill(true)
    .map((value, index) => ({
      number: index + 1,
    }));
  return pages;
};

export const fetchCurrentArticle = async (options: { slug: string }) => {
  const { slug } = options;
  if (!slug) return null;
  const { items } = await client.getContents({
    appUid: process.env.NEXT_PUBLIC_NEWT_APP_UID,
    modelUid: process.env.NEXT_PUBLIC_NEWT_ARTICLE_MODEL_UID,
    query: {
      depth: 2,
      limit: 1,
      slug,
    },
  });
  return items[0] || null;
};
