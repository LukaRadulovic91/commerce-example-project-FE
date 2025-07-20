import Hooks from '@/hooks';

const WelcomeHeader = () => {
	const i18n = Hooks.useI18n();

	return (
		<div className="welcome-header">
			<div className="text-primaryText text-2xl font-bold text-center pb-5 mt-10">
			    {i18n('Dobrodošli na Digitalnu komoru')}
			</div>
			<div className="text-primaryText text-center text-light mb-10">
			    {i18n('Digitalna komora je jedinstven ekosistem, koji objedinjuje sve proizvođače iz BiH na jednom mjestu, u cilju njihove prezentacije u digitalnom okruženju, te njihovog umrežavanja i povezivanja sa potencijalnim kupcima, kako na domaćem, tako i na inostranom tržištu.')}
				{i18n('\nU fokusu Digitalne komore je proizvod / usluga proizvedena u BiH kao i alati i dokumenti koji će olakšati Vaše izvozne, uvozne i ostale poslovne aktivnosti.')}
			</div>
		</div>
	);
};

export default WelcomeHeader;
