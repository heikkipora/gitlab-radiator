import React from 'react'
import ReactDOM from 'react-dom'

class RadiatorApp extends React.Component {
  constructor() {
    super()
    this.state = {
      builds: undefined,
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
      <ol className="projects">{this.renderBuilds(this.state.builds || [])}</ol>
    </div>
  }

  renderErrorMessage() {
    return this.state.error ? <div className="error">{this.state.error}</div> : ''
  }

  renderProgressMessage() {
    if (!this.state.builds) {
      return <h2 className="loading">Fetching projects and builds from GitLab...</h2>
    } else if (this.state.builds.length === 0) {
      return <h2 className="loading">No projects with builds found.</h2>
    }
    return ''
  }

  renderBuilds(builds) {
    return builds.map(build => {
      const isFailed = build.builds.some(b => b.status === 'failed')
      const isRunning = build.builds.some(b => b.status === 'running')
      return <li className={`project ${isFailed && 'failed'} ${isRunning && 'running'}`}
                 key={build.project.id}>
        <h2>{build.project.name}</h2>
        {this.renderPhases(build)}
        {build.commit.map((commit, index) => {
          return <div className="commit" key={index}>
            <div>
              <div className="commit-author">{commit.authorName}</div>
              <div className="commit-timestamp">{commit.createdAt}</div>
            </div>
            <div>
              <div className="commit-title">{commit.title}</div>
            </div>
          </div>
        })}
      </li>
    })
  }

  renderPhases(build) {
    const phasesToRender = this.calculatePhasesToRender(build)
    return <ol className="phases">{phasesToRender.map(phase => {
        const className = `phase ${phase.status}` +
          (phase.hiddenFromStart ? ' hidden-from-start' : '') +
          (phase.hiddenFromEnd ? ' hidden-from-end' : '')
        return <li className={className} key={phase.id}><div className="phase-name">{phase.name}</div></li>
      })}
    </ol>
  }

  // eslint-disable-next-line class-methods-use-this
  calculatePhasesToRender(build) {
    return build.builds.reduce((acc, phase) => {
      if (acc.length < 4) {
        acc.push(phase)
      } else if (acc[0].status === 'success') {
        acc = acc.slice(1)
        acc.push(phase)
        acc[0].hiddenFromStart = true
      } else {
        acc[acc.length - 1].hiddenFromEnd = true
      }
      return acc
    }, [])
  }

  onServerStateUpdated(state) {
    this.setState({builds: state.builds, error: state.error})
  }

  onDisconnect() {
    this.setState({error: 'gitlab-radiator server is offline'})
  }
}

ReactDOM.render(<RadiatorApp />, document.getElementById('app'))
