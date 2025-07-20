import { useSelector } from 'react-redux';

const fn = state => state.language;
const useLanguage = () => useSelector(fn);
export default useLanguage;
