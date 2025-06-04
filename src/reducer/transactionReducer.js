export const initialState = {
  transactions: [],
};

export const transactionReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "MARK_RECEIVED":
      return {
        ...state,
        transactions: state.transactions.map((txn) =>
          txn.id === action.payload ? { ...txn, status: "received" } : txn
        ),
      };
    default:
      return state;
  }
};
