import { memo } from 'react';
import { connect } from 'react-redux';

import Snack from './Snack';

const Snackbar = memo(({ snacks }) =>
	snacks.length === 0 ? null : (
		<div id="snackbar">
			{snacks.map(snack => (
				<Snack key={snack.id} snack={snack} />
			))}
		</div>
	)
);

export default connect(state => ({
	snacks: state.snacks,
}))(Snackbar);
