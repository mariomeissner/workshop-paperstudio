import { api } from '../api';

export const useUpsertEntryMutation = () => {
  const apiUtils = api.useContext();
  return api.library.upsertEntry.useMutation({
    onMutate: async (newLibraryEntry) => {
      await apiUtils.library.getEntry.cancel({
        userId: newLibraryEntry.userId,
        paperId: newLibraryEntry.paperId,
      });

      apiUtils.library.getEntry.setData(
        {
          userId: newLibraryEntry.userId,
          paperId: newLibraryEntry.paperId,
        },
        {
          entry: {
            ...newLibraryEntry,
            wantToRead: newLibraryEntry.wantToRead ?? false,
          },
        },
      );
    },
    onError: (error, newLibraryEntry, _context) => {
      console.log(error);
      apiUtils.library.getEntry.setData(
        {
          userId: newLibraryEntry.userId,
          paperId: newLibraryEntry.paperId,
        },
        {
          entry: null,
        },
      );
    },
    onSettled: async (data, error, newLibraryEntry, _context) => {
      await apiUtils.library.getEntry.invalidate({
        userId: newLibraryEntry.userId,
        paperId: newLibraryEntry.paperId,
      });
    },
  });
};

export const useRemoveEntryMutation = () => {
  const apiUtils = api.useContext();
  return api.library.removeEntry.useMutation({
    onMutate: async (newLibraryEntry) => {
      await apiUtils.library.getEntry.cancel({
        userId: newLibraryEntry.userId,
        paperId: newLibraryEntry.paperId,
      });

      const previousEntry = apiUtils.library.getEntry.getData();

      apiUtils.library.getEntry.setData(
        {
          userId: newLibraryEntry.userId,
          paperId: newLibraryEntry.paperId,
        },
        {
          entry: null,
        },
      );
      return { previousEntry };
    },
    onError: (error, newLibraryEntry, _context) => {
      console.log(error);
      apiUtils.library.getEntry.setData(
        {
          userId: newLibraryEntry.userId,
          paperId: newLibraryEntry.paperId,
        },
        {
          entry: _context?.previousEntry?.entry ?? null,
        },
      );
    },
    onSettled: async (data, error, newLibraryEntry, _context) => {
      await apiUtils.library.getEntry.invalidate({
        userId: newLibraryEntry.userId,
        paperId: newLibraryEntry.paperId,
      });
    },
  });
};
