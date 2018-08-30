import React from "react";
import PropTypes from 'prop-types';

export class Job extends React.PureComponent {
    render() {
        const {job} = this.props;

        return <li className={job.status}>
            {job.name}
        </li>
    }
}

Job.propTypes = {
    job: PropTypes.object
}
