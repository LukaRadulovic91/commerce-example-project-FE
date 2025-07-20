import { useEffect } from 'react';

import Actions from '@/actions';
import Hooks from '@/hooks';

import Icon from '@ui/Icon';

const Snack = ({ snack }) => {
	const i18n = Hooks.useI18n();
	useEffect(() => {
		if (snack.opts?.persist) {
			return undefined;
		}

		const timeout = setTimeout(() => Actions.closeSnack(snack.id), 8000);
		return () => clearTimeout(timeout);
	}, [snack.id, snack.opts?.persist]);

	return (
		<div className="snack">
			<div
				className="absolute right-0 top-0 pt-1 pr-2 pl-1 cursor-pointer"
				onClick={() => Actions.closeSnack(snack.id)}
			>
				<Icon icon="times" />
			</div>
			<div className="flex">
				{snack.opts?.icon && (
					<div className={'w-12 h-12 rounded-md mr-3 text-5xl text-center leading-none'}>
						{snack.opts.icon}
					</div>
				)}
				<div>
					<h2 className="uppercase text-xs font-bold">{i18n(snack.title)}</h2>
					{snack.content}
				</div>
			</div>
		</div>
	);
};
export default Snack;
