import { api } from '../api';

type QueryProps = {
  paperId: number;
  userId: string;
  enabled: boolean;
};

export const getUserTagsForPaperQuery = ({
  paperId,
  userId,
  enabled,
}: QueryProps) => {
  const { data: tagData, status: tagsQueryStatus } =
    api.paper.getUserTagsOnPaper.useQuery({ paperId, userId }, { enabled });
  return {
    tags: tagData?.tags,
    tagsQueryStatus,
  };
};

export const getUserTagsQuery = ({
  userId,
  enabled,
}: {
  userId: string;
  enabled: boolean;
}) => {
  const { data: userTags, status: userTagsQueryStatus } =
    api.user.getUserTags.useQuery({ userId }, { enabled });
  return {
    userTags: userTags?.tags,
    userTagsQueryStatus,
  };
};
