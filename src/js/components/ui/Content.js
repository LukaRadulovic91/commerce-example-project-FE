import { Component } from 'react';
import Footer from './Footer';

export default class Content extends Component {
	shouldComponentUpdate(nextProps) {
		return this.props.children !== nextProps.children || this.props.className !== nextProps.className;
	}

	render() {
		const { children, className } = this.props;
		const bgClass = className ? className : 'content-bg-image';
		return (
			<div id="content">
				<Footer />
				<div className={bgClass} />
				<div className={'inner-wrapper pb-4'}>{children}</div>
			</div>
		);
	}
}
