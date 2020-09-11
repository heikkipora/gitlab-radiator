import {GroupedProjects} from './groupedProjects'
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
    this.screen = this.screenArguments()
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

      <GroupedProjects now={this.state.now} zoom={this.state.zoom} columns={this.state.columns}
                       projects={this.state.projects || []} projectsOrder={this.state.projectsOrder}
                       groupSuccessfulProjects={this.state.groupSuccessfulProjects}
                       screen={this.screen}/>
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

  onServerStateUpdated = state => this.setState(state)

  onDisconnect = () => this.setState({error: 'gitlab-radiator server is offline'})

  screenArguments = () => {
    const screen = window.location.search
    const matches = (/screen=(\d)of(\d)/).exec(window.location.search)
    let id = matches ? Number(matches[1]) : 1
    const total = matches ? Number(matches[2]) : 1
    if (id > total) {
      id = total
    }
    return {
      id,
      total
    }
  }
}

ReactDOM.render(<RadiatorApp/>, document.getElementById('app'))
