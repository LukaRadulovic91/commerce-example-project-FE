import { useSelector } from 'react-redux';

const fn = state => state.viewportDevice;
const useI18n = () => useSelector(fn);
export default useI18n;
