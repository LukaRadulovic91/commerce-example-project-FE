import { useSelector } from 'react-redux';

const fn = state => state.userRole;
const useUserRole = () => useSelector(fn);
export default useUserRole;
