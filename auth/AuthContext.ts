import { createContext } from 'react';

/*
 ** **
 ** ** ** authContext
 ** **
 */
const authContext = createContext({
  isUserLoggedIn: false,
  user: { id: '', name: '', photo: '', isAnonymous: false },
  isLoading: false,
});

export default authContext;
