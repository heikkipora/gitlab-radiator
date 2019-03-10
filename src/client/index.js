import {Projects} from './projects'
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
      <Projects now={this.state.now} zoom={this.state.zoom} columns={this.state.columns}
                projects={this.state.projects || []} projectsOrder={this.state.projectsOrder} />
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
}

ReactDOM.render(<RadiatorApp/>, document.getElementById('app'))
