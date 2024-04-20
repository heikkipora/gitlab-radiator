import {Jobs} from './jobs'
import React from 'react'
import type {Stage} from './gitlab-types'

export function Stages({stages, maxNonFailedJobsVisible, horizontal}: {stages: Stage[], maxNonFailedJobsVisible: number, horizontal: boolean}): JSX.Element {
  const horizontalClass = horizontal ? ' horizontal' : ''

  return <ol className={`stages${horizontalClass}`}>
    {stages.map(stage =>
      <StageElement stage={stage} maxNonFailedJobsVisible={maxNonFailedJobsVisible} horizontal={horizontal} key={stage.name}/>
    )}
  </ol>
}

function StageElement({stage, maxNonFailedJobsVisible, horizontal}: {stage: Stage, maxNonFailedJobsVisible: number, horizontal: boolean}) {
  const horizontalClass = horizontal ? ' horizontal' : ''

  return <li className={`stage${horizontalClass}`}>
    <div className="name">{stage.name}</div>
    <Jobs jobs={stage.jobs} maxNonFailedJobsVisible={maxNonFailedJobsVisible} horizontal={horizontal}/>
  </li>
}
