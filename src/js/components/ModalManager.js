import { PureComponent } from 'react';
import { connect } from 'react-redux';

import Actions from '@/actions';

import Modal from '@ui/Modal';

class ModalManager extends PureComponent {
	componentDidMount() {
		if (this.props.modals.length > 0) {
			document.addEventListener('keydown', this.handleKeyDown);
		}
	}
	componentDidUpdate(prevProps) {
		const { modals } = this.props;
		if (prevProps.modals.length === 0 && modals.length > 0) {
			document.addEventListener('keydown', this.handleKeyDown);
		} else if (prevProps.modals.length > 0 && modals.length === 0) {
			document.removeEventListener('keydown', this.handleKeyDown);
		}
	}
	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
	}
	handleKeyDown = e => {
		if (e.repeat) {
			return;
		}

		const { modals } = this.props;
		if (modals.length === 0) {
			return;
		}

		if (e.key !== 'Escape') {
			return;
		}

		const modalOnTop = modals[modals.length - 1];
		if (!modalOnTop.canCloseWithEsc) {
			return;
		}

		Actions.closeModal(modalOnTop.id);
	};
	render() {
		const { modals } = this.props;
		if (modals.length === 0) {
			return null;
		}

		return (
			<div id="modal-manager">
				{modals.map(modal => (
					<Modal key={modal.id} {...modal}>
						{modal.content}
					</Modal>
				))}
			</div>
		);
	}
}

export default connect(state => ({
	modals: state.modals,
}))(ModalManager);
