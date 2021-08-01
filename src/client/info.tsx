import type {Pipeline} from './gitlab-types'
import React from 'react'
import {renderTimestamp} from './renderTimestamp'

export function Info({pipeline, now}: {pipeline: Pipeline, now: number}): JSX.Element {
  return <div className="pipeline-info">
    <div>
      <span>{pipeline.commit ? pipeline.commit.author : '-'}</span>
      <span>{pipeline.commit ? `'${pipeline.commit.title}'` : '-'}</span>
    </div>
    <div>
      <span>{renderTimestamp(pipeline.stages, now)}</span>
      <span>on {pipeline.ref}</span>
    </div>
  </div>
}
