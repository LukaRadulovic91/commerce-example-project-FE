import Hooks from '@/hooks';
import Pdf from "../../../static/Digitalna_Komora_Korisnicko_upustvo.pdf";

import Persistence from '@/modules/Persistence';

const FormHeader = () => {
	const i18n = Hooks.useI18n();

	const onOpenInstructions = () => {
		window.open(Pdf);
	}

	return (
		<div className="flex flex-col xs:mx-10 sm:mx-20 mt-10">
			<div className="flex flex-row">
			    <div className="logo" />
			</div>
			<div className="mb-4 mt-4 text-greyText">
			    <div className="hidden">{i18n('Molimo pogledajte kratki video sa uputstvom za registraciju.')}</div>
				<br/>
				<a className="cursor-pointer" onClick={onOpenInstructions}>{i18n('Detaljna korisnička uputstva možete preuzeti ')}<span className="text-orange">{' '}{i18n('ovdje')}</span></a>
				<br/>
				<div>{i18n('Molimo pristupite procesu registracije')}</div>
			</div>
		</div>
	);
};

export const ForgotPasswordHeader = () => {
	const i18n = Hooks.useI18n();
	const onOpenInstructions = () => {
		window.open(Pdf);
	}
	return (
		<div className="flex flex-col  xs:mx-10 sm:mx-20 mt-10">
			<div className="flex flex-row">
			    <div className="logo" />
			</div>
			<div className="mb-4 mt-4 text-greyText">
			    <div className="hidden">{i18n('Molimo pogledajte kratki video sa uputstvom za registraciju.')}</div>
				<br/>
				<a className="cursor-pointer" onClick={onOpenInstructions}>{i18n('Detaljna korisnička uputstva možete preuzeti ')}<span className="text-orange">{' '}{i18n('ovdje')}</span></a>
				<br/>
			</div>
		</div>
	);
};


export const LoginHeader = props => {
	const i18n = Hooks.useI18n();
	const onOpenInstructions = () => {
		window.open(Pdf);
	}
	const hideInstructions = props.hideInstructions;
	const isAdmin = props.isAdmin;
	return (
		<div className={'flex flex-col xs:mx-10 sm:mx-20 mt-10' + ' ' + props.className}>
			<div className="flex flex-row">
			    <div className="logo" />
			</div>
			{!hideInstructions && 
				<div className="mb-4 mt-4 text-greyText">
					<div className="hidden">{i18n('Molimo pogledajte kratki video sa uputstvom za registraciju.')}</div>
					<br/>
					<a className="cursor-pointer" onClick={onOpenInstructions}>{i18n('Detaljna korisnička uputstva možete preuzeti ')}<span className="text-orange">{' '}{i18n('ovdje')}</span></a>
				</div>
			}
			{isAdmin && 
				<div className="mt-10 text-greyText">
					<div className="">{i18n('Dobrodošli na adminstrativni portal Digitalne Komore. Molimo Vas da se prijavite sa svojim korisničkim nalogom.')}</div>
				</div>
			}
		</div>
	);
};


export default FormHeader;