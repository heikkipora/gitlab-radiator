import React from "react";
import {Project} from "./project";
import _ from 'lodash'
import PropTypes from 'prop-types';

export class Projects extends React.PureComponent {
  render() {
    const {projects, zoomStyle, now} = this.props;

    return <ol className="projects" style={zoomStyle}>
      {_.sortBy(projects, 'name')
          .map(project => {
            return <Project now={now} project={project} key={project.id}/>
          })}
    </ol>;
  }
}

Projects.propTypes = {
  projects: PropTypes.array,
  zoomStyle: PropTypes.string,
  now: PropTypes.dateTime
};
