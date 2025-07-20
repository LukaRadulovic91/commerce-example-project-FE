import { useSelector } from 'react-redux';

const fn = state => state.i18n;
const useI18n = () => useSelector(fn);
export default useI18n;
