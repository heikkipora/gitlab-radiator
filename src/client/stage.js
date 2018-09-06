import React from "react";
import {Jobs} from "./jobs";
import PropTypes from 'prop-types';

export class Stage extends React.PureComponent {
  render() {

    const {stage} = this.props;

    return <li className="stage">
      <div className="name">{stage.name}</div>
      <Jobs jobs={stage.jobs}/>
    </li>
  }
}

Stage.propTypes = {
  stage: PropTypes.object
};
