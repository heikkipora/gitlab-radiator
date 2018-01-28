import _ from 'lodash'
import {distanceInWords} from 'date-fns'
import React from 'react'
import ReactDOM from 'react-dom'

class RadiatorApp extends React.Component {
  constructor() {
    super()
    this.state = {
      projects: undefined,
      error: undefined
    }
  }

  componentDidMount() {
    const socket = window.io()
    socket.on('state', this.onServerStateUpdated.bind(this))
    socket.on('disconnect', this.onDisconnect.bind(this))
  }

  render() {
    return <div>
      {this.renderErrorMessage()}
      {this.renderProgressMessage()}
      <ol className="projects">{this.renderProjects(this.state.projects || [])}</ol>
    </div>
  }

  renderErrorMessage() {
    return this.state.error && <div className="error">{this.state.error}</div>
  }

  renderProgressMessage() {
    if (!this.state.projects) {
      return <h2 className="loading">Fetching projects and CI pipelines from GitLab...</h2>
    } else if (this.state.projects.length == 0) {
      return <h2 className="loading">No projects with CI pipelines found.</h2>
    }
    return null
  }

  renderProjects(projects) {
    return _.sortBy(projects, 'name')
      .map(project => {
        const [pipeline] = project.pipelines
        return <li className={`project ${project.status}`} key={project.id}>
          <h2>{project.name}</h2>
          {this.renderStages(pipeline.stages)}
          <div className="pipeline-info">
            <span>{this.renderTimestamp(pipeline.stages)}</span>
            <span>{pipeline.commit.author}: &quot;{pipeline.commit.title}&quot;</span>
          </div>
        </li>
      })
  }

  renderStages(stages) {
    return <ol className="stages">
            {stages.map((stage, index) => this.renderStage(stage, index))}
           </ol>
  }

  renderStage(stage, index) {
    return <li className="stage" key={index}>
             <div className="name">{stage.name}</div>
             <ol className="jobs">
               {stage.jobs.map(this.renderJob)}
             </ol>
           </li>
  }

  renderJob(job) {
    return <li key={job.id} className={job.status}>
             {job.name}
           </li>
  }

  renderTimestamp(stages) {
    const timestamps = _(stages)
      .map('jobs')
      .flatten()
      .map(job => {
        const startedAt = job.startedAt && new Date(job.startedAt).valueOf()
        const finishedAt = job.finishedAt && new Date(job.finishedAt).valueOf()
        return {
          startedAt,
          finishedAt
        }
      })
      .filter(timestamp => timestamp.startedAt)
      .value()

    if (timestamps.length === 0) {
      return 'Pending...'
    }

    const inProgress = _.some(timestamps, {finishedAt: undefined})
    if (inProgress) {
      const timestamp = _(timestamps).sortBy('startedAt').head()
      return `Started ${this.formatDate(timestamp.startedAt)} ago`
    }

    const timestamp = _(timestamps).sortBy('finishedAt').last()
    return `Finished ${this.formatDate(timestamp.finishedAt)} ago`
  }

  formatDate(timestamp) {
    return distanceInWords(timestamp, new Date())
  }

  onServerStateUpdated(state) {
    this.setState({projects: state.projects, error: state.error})
  }

  onDisconnect() {
    this.setState({error: 'gitlab-radiator server is offline'})
  }
}

ReactDOM.render(<RadiatorApp />, document.getElementById('app'))
