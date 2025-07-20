import _ from 'lodash';
import { Link } from 'react-router-dom';

import { ajaxGET, handleError } from '@/modules/ajax';
import minidash from '@/modules/minidash';
import Hooks from '@/hooks';
import PartnerLogoSlider from './PartnerLogoSlider';
import { useEffect, useState } from 'react';
import PrivacyPdf from "../../../static/Digitalna_Komora-Izjava_o_zaštiti_podataka.pdf";
import InstructionPdf from "../../../static/Digitalna_Komora_Korisnicko_upustvo.pdf";

const DKFooter = ({ className }) => {
	const i18n = Hooks.useI18n();
    const [slides, setSlides] = useState([]);
    const [links, setLinks] = useState([]);

    const onOpenPrivacyPolicy = () => {
		window.open(PrivacyPdf, '_blank');
	}

    const onOpenInstructions = () => {
		window.open(InstructionPdf, '_blank');
	}


    useEffect(() => {
        ajaxGET({
            api: '/content/links/footer',
            success: response => {
                if (response.success && response.message === "OK") {
                    let links = response.data;
                    setLinks(links);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
            infiniteRetries: false,
        });
        ajaxGET({
            api: '/content/sliders/sellers/slajder_footer',
            success: response => {
                if (response.success && response.message === "OK") {
                    let slides = response.data;
                    setSlides(slides?.content);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
            },
            infiniteRetries: false,
        });
	}, []);

    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    const ExternalLinks = () => {
        if (!links || links.length === 0) {
            return null
        }
        
        return (
            <div className="flex flex-col footer-links ml-10">
                <div className="footer-links-header">{i18n('Eksterni linkovi')}</div>
                {_.map(links, link => (
                    <a key={link.url} target="_blank" rel="noreferrer" className="footer-link" href={link.url}>
                        {link.label}
                    </a>
                ))}
            </div>
        )
    }

    const InternalLinks = () => {
        return (
            <div className="flex flex-col footer-links ml-10">
                <div className="footer-links-header">{i18n('Interni linkovi')}</div>
                <div className="footer-link cursor-pointer" onClick={onOpenPrivacyPolicy}>{i18n('Pravila i uslovi korištenja')}</div>
                <div className="footer-link cursor-pointer" onClick={onOpenInstructions}>{i18n('Detaljna korisnička uputstva')}</div>
                <Link to="/contact-us" className="footer-link cursor-pointer">{i18n('Kontaktirajte nas')}</Link>
            </div>
        )
    }

    const hide = window.location.pathname == '/login' || window.location.pathname == '/forgot_password' || window.location.pathname == '/signup'

    if (hide) {
        return null
    }

	return (
        <div className="footer-container-wrapper">
            <div className="footer-container flex-col sm:flex-row px-content-mobile md:px-content">
                <PartnerLogoSlider slides={slides} className="ml-auto mr-auto sm:ml-0 sm:mr-0" />
                <ExternalLinks />
                <InternalLinks />
                {isIE && ( 
                    <div
                        className={minidash.cs('relative text-greyText flex flex-col py-2 text-sm z-10 bg-white rounded-lg w-1/2 ml-auto mr-auto mt-10 text-center', className)}
                    >
                        {i18n('Za najbolje iskustvo pri korištenju Digitalne Komore, molimo vas koristite jedan od pretraživača: Edge, Chrome, Mozilla Firefox, Safari ili Opera.')}
                    </div>
                )}
            </div>
            <div className="footer-disclaimer px-content-mobile md:px-content">
                <div>Autorka prava © 2020 Digitalnakomora.ba. Sva prava zadržana.</div>
                <br/>
                <div>Sav sadržaj objavljuju korisnici, a digitalna komora neće snositi odgovornost za bilo kakve ponude, profile kompanija, proizvode, slike i drugi sadržaj koji su objavili korisnici. U slučaju bilo kakvih pritužbi, kontaktirajte nas na support@digitalnakomora.ba</div>
            </div>
        </div>
	);
};

export default DKFooter;
