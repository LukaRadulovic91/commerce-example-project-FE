import _ from 'lodash';

import Hooks from '@/hooks';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import Content from '@ui/Content';

import 'css/pages/home.css';

const Home = () => {
	const i18n = Hooks.useI18n();
	Hooks.useTitle(i18n('Digitalna Komora'));
	const [showVideo, setShowVideo] = useState(false);

	return (
		<Content className="content-home-bg-image">
			{showVideo && (
				<div onClick={() => setShowVideo(!showVideo)} className="fixed w-full h-full pin z-50 overflow-auto bg-black-semitransparent flex">
					<div className="ml-auto mr-auto mt-auto mb-auto">
						<iframe id="player" type="text/html" width="800" height="600"
							src="https://www.youtube.com/embed/N6ndRRKw1KE?enablejsapi=1&origin=https://digitalnakomora.ba&ab_channel=DigitalnaKomora"
							frameborder="0" />
					</div>
					
				</div>
			)}
			<div className="home-content">
				<div className="home-left-col">
            		<div className="logo" />
					<div className="home-stinger text-orange text-xl mt-4">
						<div>{i18n('Pitate se s kim i kako poslovati?')}</div>
						<div>{i18n('Na pravom ste mjestu!')}</div>
					</div>
					<div className="home-welcome font-bold text-4xl mt-3">
						{i18n('Dobrodošli na Digitalnu komoru!')}
					</div>
					<div className="home-description text-greyText text-sm mt-4">
						<div>{i18n('Digitalna komora je jedinstven ekosistem, koji objedinjuje proizvođače iz Bosne i Hercegovine na jednom mjestu, u cilju njihove prezentacije u digitalnom okruženju, te njihovog umrežavanja i povezivanja sa potencijalnim kupcima, kako na domaćem, tako i na inostranom tržištu.')}</div>
						<br/>
						<div>{i18n('U fokusu Digitalne komore je proizvod/usluga proizvedena u BiH, ali i dodatni alati i dokumenti koji će olakšati vaše uvozne, izvozne i ostale poslovne aktivnosti.')}</div>
						<br/>
						<div>{i18n('Za donošenje kvalitetnih poslovnih odluka i unapređenje vašeg poslovanja postanite dio DIGITALNE KOMORE.')}</div>
					</div>
					<div className="home-buttons flex flex-row mt-6 mb-4">
						<Link to="/login" className="button login-button home-login-button px-8 text-xl">
							{i18n('Prijava')}
						</Link>
						<div onClick={() => setShowVideo(!showVideo)} className="cursor-pointer home-video-link ml-10 text-center text-greyText">
							{i18n('Pogledajte video')}
						</div>
						<div onClick={() => setShowVideo(!showVideo)} className="cursor-pointer play-video-icon ml-3" />
					</div>
				</div>
				<div className="home-right-col">
					<div className="home-welcome-image" />
				</div>
			</div>
			<div className="vtk_logo_wrapper">
				<div className="vtk_logo_horizontal mb-10" />
			</div>
		</Content>
	);
};

export default Home;
