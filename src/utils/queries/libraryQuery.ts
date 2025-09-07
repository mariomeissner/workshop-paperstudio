import { api } from '../api';

type QueryProps = {
  paperId: number;
  userId: string;
  enabled: boolean;
};
export const getEntryQuery = ({ paperId, userId, enabled }: QueryProps) => {
  const {
    data: libraryData,
    status: getEntryStatus,
    isRefetching: getEntryRefetching,
  } = api.library.getEntry.useQuery({ paperId, userId }, { enabled });
  return {
    entry: libraryData?.entry,
    getEntryStatus,
    getEntryRefetching,
  };
};
