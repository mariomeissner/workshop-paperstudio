import { api } from '~/utils/api';

export const useAddTagMutation = () => {
  const apiUtils = api.useContext();
  return api.paper.addUserTagToPaper.useMutation({
    onMutate: async (newTagParams) => {
      const newTag = {
        id: newTagParams.tagId,
        userId: newTagParams.userId,
        paperId: newTagParams.paperId,
        name: newTagParams.name,
      };
      await apiUtils.paper.getUserTagsOnPaper.cancel({
        userId: newTag.userId,
        paperId: newTag.paperId,
      });

      const previousTags = apiUtils.paper.getUserTagsOnPaper.getData();

      apiUtils.paper.getUserTagsOnPaper.setData(
        {
          userId: newTag.userId,
          paperId: newTag.paperId,
        },
        (previousTags) => {
          if (previousTags === undefined) {
            return {
              tags: [newTag],
            };
          }
          return {
            tags: [...previousTags.tags, newTag],
          };
        },
      );
      return { previousTags };
    },

    onError: (error, params, context) => {
      console.log(error);
      apiUtils.paper.getUserTagsOnPaper.setData(
        {
          userId: params.userId,
          paperId: params.paperId,
        },
        context?.previousTags,
      );
    },
    onSettled: async (newTag, error, params, _context) => {
      await apiUtils.paper.getUserTagsOnPaper.invalidate({
        paperId: params.paperId,
        userId: params.userId,
      });
      await apiUtils.user.getUserTags.invalidate({
        userId: params.userId,
      });
    },
  });
};

export const useRemoveTagMutation = () => {
  const apiUtils = api.useContext();
  return api.paper.removeUserTagOnPaper.useMutation({
    onMutate: async (params) => {
      await apiUtils.paper.getUserTagsOnPaper.cancel({
        userId: params.userId,
        paperId: params.paperId,
      });

      const previousTags = apiUtils.paper.getUserTagsOnPaper.getData();

      apiUtils.paper.getUserTagsOnPaper.setData(
        {
          userId: params.userId,
          paperId: params.paperId,
        },
        (previousTags) => {
          if (previousTags === undefined) {
            return {
              tags: [],
            };
          }
          return {
            tags: previousTags.tags.filter((t) => t.name !== params.name),
          };
        },
      );
      return { previousTags };
    },
    onError: (error, tag, context) => {
      console.log(error);
      apiUtils.paper.getUserTagsOnPaper.setData(
        {
          userId: tag.userId,
          paperId: tag.paperId,
        },
        context?.previousTags,
      );
    },
    onSettled: async (tag, error, variables, _context) => {
      await apiUtils.paper.getUserTagsOnPaper.invalidate({
        userId: variables.userId,
        paperId: variables.paperId,
      });
    },
  });
};

export const useCreateTagMutation = () => {
  const apiUtils = api.useContext();
  return api.paper.createTag.useMutation({
    onMutate: async (newTagParams) => {
      const newTag = {
        id: 'OPTIMISTIC_ID',
        userId: newTagParams.userId,
        paperId: newTagParams.paperId,
        name: newTagParams.name,
      };
      await apiUtils.user.getUserTags.cancel({
        userId: newTag.userId,
      });
      if (newTag.paperId) {
        await apiUtils.paper.getUserTagsOnPaper.cancel({
          userId: newTag.userId,
          paperId: newTag.paperId,
        });
      }

      const previousTags = apiUtils.user.getUserTags.getData();
      const previousTagsOnPaper = apiUtils.paper.getUserTagsOnPaper.getData();

      apiUtils.user.getUserTags.setData(
        {
          userId: newTag.userId,
        },
        (previousTags) => {
          if (previousTags === undefined) {
            return {
              tags: [newTag],
            };
          }
          return {
            tags: [...previousTags.tags, newTag],
          };
        },
      );

      if (newTag.paperId) {
        apiUtils.paper.getUserTagsOnPaper.setData(
          {
            userId: newTag.userId,
            paperId: newTag.paperId,
          },
          (previousTags) => {
            if (previousTags === undefined) {
              return {
                tags: [newTag],
              };
            }
            return {
              tags: [...previousTags.tags, newTag],
            };
          },
        );
      }
      return { previousTags, previousTagsOnPaper };
    },

    onError: (error, params, context) => {
      console.log(error);
      apiUtils.user.getUserTags.setData(
        {
          userId: params.userId,
        },
        context?.previousTags,
      );
      if (params.paperId) {
        apiUtils.paper.getUserTagsOnPaper.setData(
          {
            userId: params.userId,
            paperId: params.paperId,
          },
          context?.previousTagsOnPaper,
        );
      }
    },
    onSettled: async (newTag, error, params, _context) => {
      await apiUtils.paper.getUserTagsOnPaper.invalidate({
        paperId: params.paperId,
        userId: params.userId,
      });
      await apiUtils.user.getUserTags.invalidate({
        userId: params.userId,
      });
    },
  });
};
