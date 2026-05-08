import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Category, CategoryList, CreateCategoryBody, CreatePostBody, CreateTagBody, DeleteCategoryParams, ErrorResponse, GetFeaturedPostsParams, GetPostsPerCategoryParams, GetPostBySlugParams, GetPostParams, GetRecentPostsParams, HealthStatus, ListCategoriesParams, ListPostsParams, Post, PostList, PostsPerCategoryList, StatsSummary, Tag, TagList, TranslationList, UpdateCategoryBody, UpdatePostBody, UpsertTranslationsBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all posts
 */
export declare const getListPostsUrl: (params?: ListPostsParams) => string;
export declare const listPosts: (params?: ListPostsParams, options?: RequestInit) => Promise<PostList>;
export declare const getListPostsQueryKey: (params?: ListPostsParams) => readonly ["/api/posts", ...ListPostsParams[]];
export declare const getListPostsQueryOptions: <TData = Awaited<ReturnType<typeof listPosts>>, TError = ErrorType<unknown>>(params?: ListPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPostsQueryResult = NonNullable<Awaited<ReturnType<typeof listPosts>>>;
export type ListPostsQueryError = ErrorType<unknown>;
/**
 * @summary List all posts
 */
export declare function useListPosts<TData = Awaited<ReturnType<typeof listPosts>>, TError = ErrorType<unknown>>(params?: ListPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new post
 */
export declare const getCreatePostUrl: () => string;
export declare const createPost: (createPostBody: CreatePostBody, options?: RequestInit) => Promise<Post>;
export declare const getCreatePostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPost>>, TError, {
        data: BodyType<CreatePostBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPost>>, TError, {
    data: BodyType<CreatePostBody>;
}, TContext>;
export type CreatePostMutationResult = NonNullable<Awaited<ReturnType<typeof createPost>>>;
export type CreatePostMutationBody = BodyType<CreatePostBody>;
export type CreatePostMutationError = ErrorType<unknown>;
/**
 * @summary Create a new post
 */
export declare const useCreatePost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPost>>, TError, {
        data: BodyType<CreatePostBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPost>>, TError, {
    data: BodyType<CreatePostBody>;
}, TContext>;
/**
 * @summary Get a post by ID or slug
 */
export declare const getGetPostUrl: (id: number, params?: GetPostParams) => string;
export declare const getPost: (id: number, params?: GetPostParams, options?: RequestInit) => Promise<Post>;
export declare const getGetPostQueryKey: (id: number, params?: GetPostParams) => readonly [`/api/posts/${number}`, ...GetPostParams[]];
export declare const getGetPostQueryOptions: <TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<ErrorResponse>>(id: number, params?: GetPostParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPostQueryResult = NonNullable<Awaited<ReturnType<typeof getPost>>>;
export type GetPostQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a post by ID or slug
 */
export declare function useGetPost<TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<ErrorResponse>>(id: number, params?: GetPostParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a post
 */
export declare const getUpdatePostUrl: (id: number) => string;
export declare const updatePost: (id: number, updatePostBody: UpdatePostBody, options?: RequestInit) => Promise<Post>;
export declare const getUpdatePostMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePost>>, TError, {
        id: number;
        data: BodyType<UpdatePostBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePost>>, TError, {
    id: number;
    data: BodyType<UpdatePostBody>;
}, TContext>;
export type UpdatePostMutationResult = NonNullable<Awaited<ReturnType<typeof updatePost>>>;
export type UpdatePostMutationBody = BodyType<UpdatePostBody>;
export type UpdatePostMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update a post
 */
export declare const useUpdatePost: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePost>>, TError, {
        id: number;
        data: BodyType<UpdatePostBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePost>>, TError, {
    id: number;
    data: BodyType<UpdatePostBody>;
}, TContext>;
/**
 * @summary Delete a post
 */
export declare const getDeletePostUrl: (id: number) => string;
export declare const deletePost: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePost>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePost>>, TError, {
    id: number;
}, TContext>;
export type DeletePostMutationResult = NonNullable<Awaited<ReturnType<typeof deletePost>>>;
export type DeletePostMutationError = ErrorType<unknown>;
/**
 * @summary Delete a post
 */
export declare const useDeletePost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePost>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePost>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get a post by slug
 */
export declare const getGetPostBySlugUrl: (slug: string, params?: GetPostBySlugParams) => string;
export declare const getPostBySlug: (slug: string, params?: GetPostBySlugParams, options?: RequestInit) => Promise<Post>;
export declare const getGetPostBySlugQueryKey: (slug: string, params?: GetPostBySlugParams) => readonly [`/api/posts/slug/${string}`, ...GetPostBySlugParams[]];
export declare const getGetPostBySlugQueryOptions: <TData = Awaited<ReturnType<typeof getPostBySlug>>, TError = ErrorType<ErrorResponse>>(slug: string, params?: GetPostBySlugParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostBySlug>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPostBySlug>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPostBySlugQueryResult = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;
export type GetPostBySlugQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a post by slug
 */
export declare function useGetPostBySlug<TData = Awaited<ReturnType<typeof getPostBySlug>>, TError = ErrorType<ErrorResponse>>(slug: string, params?: GetPostBySlugParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostBySlug>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all categories
 */
export declare const getListCategoriesUrl: (params?: ListCategoriesParams) => string;
export declare const listCategories: (params?: ListCategoriesParams, options?: RequestInit) => Promise<CategoryList>;
export declare const getListCategoriesQueryKey: (params?: ListCategoriesParams) => readonly ["/api/categories", ...ListCategoriesParams[]];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(params?: ListCategoriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(params?: ListCategoriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a category
 */
export declare const getCreateCategoryUrl: () => string;
export declare const createCategory: (createCategoryBody: CreateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CreateCategoryBody>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
 * @summary Create a category
 */
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CreateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CreateCategoryBody>;
}, TContext>;
/**
 * @summary Get a category by ID
 */
export declare const getGetCategoryUrl: (id: number) => string;
export declare const getCategory: (id: number, options?: RequestInit) => Promise<Category>;
export declare const getGetCategoryQueryKey: (id: number) => readonly [`/api/categories/${number}`];
export declare const getGetCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getCategory>>>;
export type GetCategoryQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a category by ID
 */
export declare function useGetCategory<TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a category
 */
export declare const getUpdateCategoryUrl: (id: number) => string;
export declare const updateCategory: (id: number, updateCategoryBody: UpdateCategoryBody, options?: RequestInit) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<UpdateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<UpdateCategoryBody>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<UpdateCategoryBody>;
export type UpdateCategoryMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update a category
 */
export declare const useUpdateCategory: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<UpdateCategoryBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<UpdateCategoryBody>;
}, TContext>;
/**
 * @summary Delete a category
 */
export declare const getDeleteCategoryUrl: (id: number, params?: DeleteCategoryParams) => string;
export declare const deleteCategory: (id: number, params?: DeleteCategoryParams, options?: RequestInit) => Promise<void>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
        params?: DeleteCategoryParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
    params?: DeleteCategoryParams;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
/**
 * @summary Delete a category
 */
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
        params?: DeleteCategoryParams;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
    params?: DeleteCategoryParams;
}, TContext>;
/**
 * @summary Get full category hierarchy tree
 */
export declare const getGetCategoryTreeUrl: () => string;
export declare const getCategoryTree: (options?: RequestInit) => Promise<CategoryList>;
export declare const getGetCategoryTreeQueryKey: () => readonly ["/api/categories/tree"];
export declare const getGetCategoryTreeQueryOptions: <TData = Awaited<ReturnType<typeof getCategoryTree>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategoryTree>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategoryTree>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryTreeQueryResult = NonNullable<Awaited<ReturnType<typeof getCategoryTree>>>;
export type GetCategoryTreeQueryError = ErrorType<unknown>;
/**
 * @summary Get full category hierarchy tree
 */
export declare function useGetCategoryTree<TData = Awaited<ReturnType<typeof getCategoryTree>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategoryTree>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all tags
 */
export declare const getListTagsUrl: () => string;
export declare const listTags: (options?: RequestInit) => Promise<TagList>;
export declare const getListTagsQueryKey: () => readonly ["/api/tags"];
export declare const getListTagsQueryOptions: <TData = Awaited<ReturnType<typeof listTags>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTags>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTags>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTagsQueryResult = NonNullable<Awaited<ReturnType<typeof listTags>>>;
export type ListTagsQueryError = ErrorType<unknown>;
/**
 * @summary List all tags
 */
export declare function useListTags<TData = Awaited<ReturnType<typeof listTags>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTags>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a tag
 */
export declare const getCreateTagUrl: () => string;
export declare const createTag: (createTagBody: CreateTagBody, options?: RequestInit) => Promise<Tag>;
export declare const getCreateTagMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTag>>, TError, {
        data: BodyType<CreateTagBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTag>>, TError, {
    data: BodyType<CreateTagBody>;
}, TContext>;
export type CreateTagMutationResult = NonNullable<Awaited<ReturnType<typeof createTag>>>;
export type CreateTagMutationBody = BodyType<CreateTagBody>;
export type CreateTagMutationError = ErrorType<unknown>;
/**
 * @summary Create a tag
 */
export declare const useCreateTag: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTag>>, TError, {
        data: BodyType<CreateTagBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTag>>, TError, {
    data: BodyType<CreateTagBody>;
}, TContext>;
/**
 * @summary Get all translations for a content item
 */
export declare const getGetTranslationsUrl: (contentType: "post" | "category", contentId: number) => string;
export declare const getTranslations: (contentType: "post" | "category", contentId: number, options?: RequestInit) => Promise<TranslationList>;
export declare const getGetTranslationsQueryKey: (contentType: "post" | "category", contentId: number) => readonly [`/api/translations/post/${number}` | `/api/translations/category/${number}`];
export declare const getGetTranslationsQueryOptions: <TData = Awaited<ReturnType<typeof getTranslations>>, TError = ErrorType<unknown>>(contentType: "post" | "category", contentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTranslations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTranslations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTranslationsQueryResult = NonNullable<Awaited<ReturnType<typeof getTranslations>>>;
export type GetTranslationsQueryError = ErrorType<unknown>;
/**
 * @summary Get all translations for a content item
 */
export declare function useGetTranslations<TData = Awaited<ReturnType<typeof getTranslations>>, TError = ErrorType<unknown>>(contentType: "post" | "category", contentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTranslations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Upsert translations for a content item
 */
export declare const getUpsertTranslationsUrl: (contentType: "post" | "category", contentId: number) => string;
export declare const upsertTranslations: (contentType: "post" | "category", contentId: number, upsertTranslationsBody: UpsertTranslationsBody, options?: RequestInit) => Promise<TranslationList>;
export declare const getUpsertTranslationsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof upsertTranslations>>, TError, {
        contentType: "post" | "category";
        contentId: number;
        data: BodyType<UpsertTranslationsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof upsertTranslations>>, TError, {
    contentType: "post" | "category";
    contentId: number;
    data: BodyType<UpsertTranslationsBody>;
}, TContext>;
export type UpsertTranslationsMutationResult = NonNullable<Awaited<ReturnType<typeof upsertTranslations>>>;
export type UpsertTranslationsMutationBody = BodyType<UpsertTranslationsBody>;
export type UpsertTranslationsMutationError = ErrorType<unknown>;
/**
 * @summary Upsert translations for a content item
 */
export declare const useUpsertTranslations: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof upsertTranslations>>, TError, {
        contentType: "post" | "category";
        contentId: number;
        data: BodyType<UpsertTranslationsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof upsertTranslations>>, TError, {
    contentType: "post" | "category";
    contentId: number;
    data: BodyType<UpsertTranslationsBody>;
}, TContext>;
/**
 * @summary Get dashboard summary stats
 */
export declare const getGetStatsSummaryUrl: () => string;
export declare const getStatsSummary: (options?: RequestInit) => Promise<StatsSummary>;
export declare const getGetStatsSummaryQueryKey: () => readonly ["/api/stats/summary"];
export declare const getGetStatsSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getStatsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStatsSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStatsSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getStatsSummary>>>;
export type GetStatsSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard summary stats
 */
export declare function useGetStatsSummary<TData = Awaited<ReturnType<typeof getStatsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStatsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get post counts grouped by category
 */
export declare const getGetPostsPerCategoryUrl: (params?: GetPostsPerCategoryParams) => string;
export declare const getPostsPerCategory: (params?: GetPostsPerCategoryParams, options?: RequestInit) => Promise<PostsPerCategoryList>;
export declare const getGetPostsPerCategoryQueryKey: (params?: GetPostsPerCategoryParams) => readonly ["/api/stats/posts-per-category", ...GetPostsPerCategoryParams[]];
export declare const getGetPostsPerCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getPostsPerCategory>>, TError = ErrorType<unknown>>(params?: GetPostsPerCategoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostsPerCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPostsPerCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPostsPerCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getPostsPerCategory>>>;
export type GetPostsPerCategoryQueryError = ErrorType<unknown>;
/**
 * @summary Get post counts grouped by category
 */
export declare function useGetPostsPerCategory<TData = Awaited<ReturnType<typeof getPostsPerCategory>>, TError = ErrorType<unknown>>(params?: GetPostsPerCategoryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostsPerCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get most recently published posts
 */
export declare const getGetRecentPostsUrl: (params?: GetRecentPostsParams) => string;
export declare const getRecentPosts: (params?: GetRecentPostsParams, options?: RequestInit) => Promise<PostList>;
export declare const getGetRecentPostsQueryKey: (params?: GetRecentPostsParams) => readonly ["/api/stats/recent-posts", ...GetRecentPostsParams[]];
export declare const getGetRecentPostsQueryOptions: <TData = Awaited<ReturnType<typeof getRecentPosts>>, TError = ErrorType<unknown>>(params?: GetRecentPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentPostsQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentPosts>>>;
export type GetRecentPostsQueryError = ErrorType<unknown>;
/**
 * @summary Get most recently published posts
 */
export declare function useGetRecentPosts<TData = Awaited<ReturnType<typeof getRecentPosts>>, TError = ErrorType<unknown>>(params?: GetRecentPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get featured/hero posts for homepage slider
 */
export declare const getGetFeaturedPostsUrl: (params?: GetFeaturedPostsParams) => string;
export declare const getFeaturedPosts: (params?: GetFeaturedPostsParams, options?: RequestInit) => Promise<PostList>;
export declare const getGetFeaturedPostsQueryKey: (params?: GetFeaturedPostsParams) => readonly ["/api/stats/featured-posts", ...GetFeaturedPostsParams[]];
export declare const getGetFeaturedPostsQueryOptions: <TData = Awaited<ReturnType<typeof getFeaturedPosts>>, TError = ErrorType<unknown>>(params?: GetFeaturedPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFeaturedPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFeaturedPostsQueryResult = NonNullable<Awaited<ReturnType<typeof getFeaturedPosts>>>;
export type GetFeaturedPostsQueryError = ErrorType<unknown>;
/**
 * @summary Get featured/hero posts for homepage slider
 */
export declare function useGetFeaturedPosts<TData = Awaited<ReturnType<typeof getFeaturedPosts>>, TError = ErrorType<unknown>>(params?: GetFeaturedPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map