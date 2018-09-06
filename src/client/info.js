import _ from 'lodash'
import {distanceInWords} from 'date-fns'
import PropTypes from 'prop-types'
import React from 'react'

export class Info extends React.PureComponent {
  render() {
    const {pipeline} = this.props

    return <div className="pipeline-info">
      <div>
        <span>{pipeline.commit ? pipeline.commit.author : '-'}</span>
        <span>{pipeline.commit ? `'${pipeline.commit.title}'` : '-'}</span>
      </div>
      <div>
        <span>{this.renderTimestamp(pipeline.stages)}</span>
        <span>on {pipeline.ref}</span>
      </div>
    </div>
  }

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
    distanceInWords(timestamp, new Date(this.props.now))
}

Info.propTypes = {
  pipeline: PropTypes.object,
  now: PropTypes.dateTime
}
