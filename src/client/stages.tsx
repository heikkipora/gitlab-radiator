import {Jobs} from './jobs'
import React from 'react'
import type {Stage} from './gitlab-types'

export function Stages({stages, maxNonFailedJobsVisible}: {stages: Stage[], maxNonFailedJobsVisible: number}): JSX.Element {
  return <ol className="stages">
    {stages.map((stage, index) =>
      <StageElement stage={stage} maxNonFailedJobsVisible={maxNonFailedJobsVisible} key={`${index}-${stage.name}`}/>
    )}
  </ol>
}

function StageElement({stage, maxNonFailedJobsVisible}: {stage: Stage, maxNonFailedJobsVisible: number}) {
  return <li className="stage">
    <div className="name">{stage.name}</div>
    <Jobs jobs={stage.jobs} maxNonFailedJobsVisible={maxNonFailedJobsVisible}/>
  </li>
}
