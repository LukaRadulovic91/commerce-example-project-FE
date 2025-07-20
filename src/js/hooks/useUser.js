import { useSelector } from 'react-redux';

const fn = state => state.user;
const useUser = () => useSelector(fn);
export default useUser;
