import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { NavLink } from 'react-router-dom';
import Hooks from '@/hooks';

const CurrentSearchBreadcrumb = () => {
    const i18n = Hooks.useI18n();
    return (
        <span>{i18n('Trenutna pretraga ')}</span>
    ) 
};

const CompanyBreadcrumb = () => {
  const i18n = Hooks.useI18n();
  return (
      <span>{i18n('Partner ')}</span>
  ) 
};

const ProductBreadcrumb = () => {
  const i18n = Hooks.useI18n();
  return (
      <span>{i18n('Proizvod ')}</span>
  ) 
};

const SearchBreadcrumb = () => {
    const i18n = Hooks.useI18n();
    return (
        <span>{i18n('Pretraga ')}<i className="fas fa-angle-right mx-2" /></span>
    ) 
};

const HomeBreadcrumb = () => {
    const i18n = Hooks.useI18n();
    return (
        <span>{i18n('Početna ')}<i className="fas fa-angle-right mx-2" /></span>
    )
}

// define custom breadcrumbs for certain routes.
// breadcumbs can be components or strings.
const routes = [
  { path: '/', breadcrumb: HomeBreadcrumb },
  { path: '/product_search', breadcrumb: SearchBreadcrumb },
  { path: '/seller_search', breadcrumb: SearchBreadcrumb },
  { path: '/product/:id', breadcrumb: ProductBreadcrumb },
  { path: '/company/:id', breadcrumb: CompanyBreadcrumb },
  { path: '/seller_search/:searchString/', breadcrumb: null },
  { path: '/seller_search/:searchString/:selectedNace/', breadcrumb: null },
  { path: '/seller_search/:searchString/:selectedNace/:selectedNaceNivo', breadcrumb: CurrentSearchBreadcrumb },
  { path: '/seller_search/:searchString', matchOptions: {exact: true}, breadcrumb: CurrentSearchBreadcrumb },
  { path: '/product_search/:searchString/', breadcrumb: null },
  { path: '/product_search/:searchString/:selectedHs', breadcrumb: null },
  { path: '/product_search/:searchString/:selectedHs/:selectedHsNivo', breadcrumb: CurrentSearchBreadcrumb },
  { path: '/product_search/:searchString', matchOptions: {exact: true}, breadcrumb: CurrentSearchBreadcrumb },
];

// map & render your breadcrumb components however you want.
const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs(routes, {disableDefaults: true});

  return (
    <>
      {breadcrumbs.map(({
        match,
        breadcrumb
      }) => (
        <span key={match.url}>
          <NavLink to={match.url}>{breadcrumb}</NavLink>
        </span>
      ))}
    </>
  );
};

export default Breadcrumbs;