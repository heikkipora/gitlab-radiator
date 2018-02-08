import _ from 'lodash'
import {distanceInWords} from 'date-fns'
import React from 'react'
import ReactDOM from 'react-dom'

class RadiatorApp extends React.Component {
  constructor() {
    super()
    this.state = {
      projects: undefined,
      error: undefined,
      now: undefined
    }
  }

  componentDidMount = () => {
    const socket = window.io()
    socket.on('state', this.onServerStateUpdated.bind(this))
    socket.on('disconnect', this.onDisconnect.bind(this))
  }

  render = () =>
    <div>
      {this.renderErrorMessage()}
      {this.renderProgressMessage()}
      <ol className="projects" style={this.zoomStyle()}>{this.renderProjects(this.state.projects || [])}</ol>
    </div>

  renderErrorMessage = () =>
    this.state.error && <div className="error">{this.state.error}</div>

  renderProgressMessage = () => {
    if (!this.state.projects) {
      return <h2 className="loading">Fetching projects and CI pipelines from GitLab...</h2>
    } else if (this.state.projects.length === 0) {
      return <h2 className="loading">No projects with CI pipelines found.</h2>
    }
    return null
  }

  renderProjects = projects =>
    _.sortBy(projects, 'name')
      .map(project => {
        const [pipeline] = project.pipelines
        return <li className={`project ${project.status}`} key={project.id}>
          <h2>{project.name}</h2>
          {this.renderStages(pipeline)}
          {this.renderInfo(pipeline)}
        </li>
      })

  renderStages = pipeline =>
    <ol className="stages">
      {pipeline.stages.map((stage, index) => this.renderStage(stage, index))}
    </ol>

  renderStage = (stage, index) =>
     <li className="stage" key={index}>
       <div className="name">{stage.name}</div>
       <ol className="jobs">
         {stage.jobs.map(this.renderJob)}
       </ol>
     </li>

  renderJob = job =>
    <li key={job.id} className={job.status}>
      {job.name}
    </li>

  renderInfo = pipeline =>
    <div className="pipeline-info">
      <div>
        <span>{pipeline.commit ? pipeline.commit.author : '-'}</span>
        <span>{pipeline.commit ? `'${pipeline.commit.title}'` : '-'}</span>
      </div>
      <div>
        <span>{this.renderTimestamp(pipeline.stages)}</span>
        <span>on {pipeline.ref}</span>
      </div>
    </div>

  renderTimestamp = stages => {
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

  formatDate = timestamp =>
    distanceInWords(timestamp, new Date(this.state.now))

  zoomStyle = () => {
    const widthPercentage = Math.round(100 / this.state.zoom)
    return {
      transform: `scale(${this.state.zoom})`,
      width: `${widthPercentage}%`
    }
  }

  onServerStateUpdated = state => this.setState(state)

  onDisconnect = () => this.setState({error: 'gitlab-radiator server is offline'})
}

ReactDOM.render(<RadiatorApp />, document.getElementById('app'))
