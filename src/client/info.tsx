import React from 'react'
import {Timestamp} from './timestamp'
import type {Pipeline} from '../common/gitlab-types'

export function Info({pipeline, now}: {pipeline: Pipeline, now: number}) {
  return <div className="pipeline-info">
    <div>
      <span>{pipeline.commit ? pipeline.commit.author : '-'}</span>
      <span>{pipeline.commit ? `'${pipeline.commit.title}'` : '-'}</span>
    </div>
    <div>
      <Timestamp stages={pipeline.stages} now={now}/>
      <span>on {pipeline.ref}</span>
    </div>
  </div>
}
