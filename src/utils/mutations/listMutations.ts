import { api } from '~/utils/api';

export const useAddToListMutation = () => {
  const apiUtils = api.useContext();

  return api.list.addPaperToList.useMutation({
    // Here we optimistically update getUserListsWherePaper to
    // immediately update UI with the added list entry
    onMutate: async (newListEntry) => {
      await apiUtils.list.getUserListsWherePaper.cancel({
        paperId: newListEntry.paperId,
      });

      const previousLists = apiUtils.list.getUserListsWherePaper.getData({
        paperId: newListEntry.paperId,
      });

      const newList = apiUtils.list.getList.getData({
        listId: newListEntry.listId,
      });

      apiUtils.list.getUserListsWherePaper.setData(
        {
          paperId: newListEntry.paperId,
        },
        (previousLists) => {
          if (!previousLists?.lists || !newList?.list) return previousLists;
          return {
            lists: [...previousLists.lists, newList.list],
          };
        },
      );
      return { previousLists };
    },

    onError: (error, newListEntry, context) => {
      console.log(error);
      apiUtils.list.getUserListsWherePaper.setData(
        {
          paperId: newListEntry.paperId,
        },
        context?.previousLists,
      );
    },
    onSettled: async (data, error, newListEntry, _context) => {
      await apiUtils.list.getList.invalidate({
        listId: newListEntry.listId,
      });
      await apiUtils.list.getUserListsWherePaper.invalidate({
        paperId: newListEntry.paperId,
      });
    },
  });
};

export const useRemoveSinglePaperFromListMutation = () => {
  const apiUtils = api.useContext();

  return api.list.removeSinglePaperFromList.useMutation({
    // Here we optimistically update getUserListsWherePaper to
    // immediately update UI with the removed list entry
    onMutate: async (newListEntry) => {
      await apiUtils.list.getUserListsWherePaper.cancel({
        paperId: newListEntry.paperId,
      });

      const previousLists = apiUtils.list.getUserListsWherePaper.getData({
        paperId: newListEntry.paperId,
      });

      apiUtils.list.getUserListsWherePaper.setData(
        {
          paperId: newListEntry.paperId,
        },
        (previousLists) => {
          if (!previousLists?.lists) return previousLists;
          return {
            lists: previousLists.lists.filter(
              (list) => list.id !== newListEntry.listId,
            ),
          };
        },
      );
      return { previousLists };
    },

    onError: (error, newListEntry, context) => {
      console.log(error);
      apiUtils.list.getUserListsWherePaper.setData(
        {
          paperId: newListEntry.paperId,
        },
        context?.previousLists,
      );
    },

    onSettled: async (data, error, newListEntry, _context) => {
      await apiUtils.list.getList.invalidate({
        listId: newListEntry.listId,
      });
      await apiUtils.list.getUserListsWherePaper.invalidate({
        paperId: newListEntry.paperId,
      });
    },
  });
};

export const useRemoveMultiplePapersFromListMutation = () => {
  const apiUtils = api.useContext();

  return api.list.removeMultiplePapersFromList.useMutation({
    onError: (error, _query, _context) => {
      console.log(error);
      alert('Error removing papers from list');
    },
    onSettled: async (data, error, query, _context) => {
      await apiUtils.list.getList.invalidate({
        listId: query.listId,
      });
      await apiUtils.list.getUserLists.invalidate();
    },
  });
};

export const useCreateListMutation = () => {
  const apiUtils = api.useContext();

  return api.list.createList.useMutation({
    onError: (error, _newList, _context) => {
      console.log(error);
      alert('Error creating list');
    },
    onSettled: async (_data, _error, _newList, _context) => {
      await apiUtils.list.getUserLists.invalidate();
    },
  });
};

export const useDeleteListMutation = () => {
  const apiUtils = api.useContext();
  return api.list.deleteList.useMutation({
    onError: (error, _listId, _context) => {
      console.log(error);
      alert('Error deleting list');
    },
    onSettled: async (_data, _error, _listId, _context) => {
      await apiUtils.list.getUserLists.invalidate();
    },
  });
};

export const useChangeListPrivacyMutation = () => {
  const apiUtils = api.useContext();
  return api.list.changePrivacy.useMutation({
    onError: (error, _newList, _context) => {
      console.log(error);
      alert('Error changing list privacy');
    },
    onSettled: async (data, error, newList, _context) => {
      await apiUtils.list.getList.invalidate({
        listId: newList.listId,
      });
      await apiUtils.list.getUserLists.invalidate();
    },
  });
};
