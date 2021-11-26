import {expect} from 'chai'
import {fetchLatestPipelines} from '../src/gitlab/pipelines'
import {fetchProjects} from '../src/gitlab/projects'
import {update} from '../src/gitlab'

const gitlab = {
  url: 'https://gitlab.com',
  'access-token': 'K34Nzm3_JA1rQMML6j5h',
  maxNonFailedJobsVisible: 10
}

describe('Gitlab client', () => {
  it('Should find four projects with no filtering ', async () => {
    const config = {...gitlab}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {archived: false, default_branch: 'master', group: 'gitlab-radiator-test', id: 5385889, name: 'gitlab-radiator-test/ci-skip-test-project', nameWithoutNamespace: 'ci-skip-test-project', tags: [], url: 'https://gitlab.com/gitlab-radiator-test/ci-skip-test-project'},
      {archived: false, default_branch: 'master', group: 'gitlab-radiator-test', id: 5304923, name: 'gitlab-radiator-test/empty-test', nameWithoutNamespace: 'empty-test', tags: [], url: 'https://gitlab.com/gitlab-radiator-test/empty-test'},
      {archived: false, default_branch: 'master', group: 'gitlab-radiator-test', id: 5290928, name: 'gitlab-radiator-test/integration-test-project-2', nameWithoutNamespace: 'integration-test-project-2', tags: [], url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2'},
      {archived: false, default_branch: 'master', group: 'gitlab-radiator-test', id: 5290865, name: 'gitlab-radiator-test/integration-test-project-1', nameWithoutNamespace: 'integration-test-project-1', tags: ['display-1'], url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1'}
    ])
  })

  it('Should find one project with inclusive filtering', async () => {
    const config = {...gitlab, projects: {include: '.*project-1'}}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {archived: false, default_branch: 'master', id: 5290865, group: 'gitlab-radiator-test', name: 'gitlab-radiator-test/integration-test-project-1', nameWithoutNamespace: 'integration-test-project-1', tags: ['display-1'], url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1'}
    ])
  })

  it('Should find three projects with exclusive filtering', async () => {
    const config = {...gitlab, projects: {exclude: '.*project-1'}}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {archived: false, default_branch: 'master', id: 5385889, group: 'gitlab-radiator-test', name: 'gitlab-radiator-test/ci-skip-test-project', nameWithoutNamespace: 'ci-skip-test-project', tags: [], url: 'https://gitlab.com/gitlab-radiator-test/ci-skip-test-project'},
      {archived: false, default_branch: 'master', id: 5304923, group: 'gitlab-radiator-test', name: 'gitlab-radiator-test/empty-test', nameWithoutNamespace: 'empty-test', tags: [], url: 'https://gitlab.com/gitlab-radiator-test/empty-test'},
      {archived: false, default_branch: 'master', id: 5290928, group: 'gitlab-radiator-test', name: 'gitlab-radiator-test/integration-test-project-2', nameWithoutNamespace: 'integration-test-project-2', tags: [], url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2'}
    ])
  })

  it('Should find latest non-skipped pipeline for project', async () => {
    const config = {...gitlab}
    const pipelines = await fetchLatestPipelines(5385889, config)
    expect(pipelines).to.deep.equal(
      [{
        commit: {
          author: 'Heikki Pora',
          title: '[ci skip] do nothing'
        },
        id: 234495591,
        ref: 'master',
        stages: [{
          jobs: [{
            finishedAt: '2020-12-25T20:08:30.992Z',
            id: 932219322,
            name: 'test',
            startedAt: '2020-12-25T20:07:50.812Z',
            status: 'success',
            url: 'https://gitlab.com/gitlab-radiator-test/ci-skip-test-project/-/jobs/932219322'
          }],
          name: 'test'
        }],
        status: 'success'
      }]
    )
  })

  it('Should find latest pipelines for project (feature branch + master) with stages and retried jobs merged to one entry', async () => {
    const config = {...gitlab}
    const pipelines = await fetchLatestPipelines(5290928, config)
    expect(pipelines).to.deep.equal(
      [{
        id: 234613306,
        status: 'success',
        commit: {
          title: 'Fail more',
          author: 'Heikki Pora'
        },
        ref: 'feature/test-branch',
        stages: [
          {
            name: 'test',
            jobs: [
              {
                id: 932599898,
                status: 'success',
                name: 'fail_randomly_long_name',
                startedAt: '2020-12-26T13:59:35.397Z',
                finishedAt: '2020-12-26T14:00:11.845Z',
                url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932599898'
              }
            ]
          },
          {
            name: 'build',
            jobs: [
              {
                id: 932599715,
                status: 'success',
                name: 'build_my_stuff',
                startedAt: '2020-12-26T14:00:12.710Z',
                finishedAt: '2020-12-26T14:00:53.946Z',
                url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932599715'
              }
            ]
          }
        ]
      },
      {
        id: 234613296,
        status: 'failed',
        commit: {
          author: 'Heikki Pora',
          title: 'Fail more'
        },
        ref: 'master',
        stages: [
          {
            jobs: [
              {
                finishedAt: '2020-12-26T14:01:11.815Z',
                id: 932600811,
                name: 'fail_randomly_long_name',
                startedAt: '2020-12-26T14:00:39.928Z',
                status: 'failed',
                url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932600811'
              }
            ],
            name: 'test'
          },
          {
            jobs: [
              {
                finishedAt: '2020-12-26T13:59:28.050Z',
                id: 932599688,
                name: 'build_my_stuff',
                startedAt: '2020-12-26T13:58:54.325Z',
                status: 'success',
                url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932599688'
              }
            ],
            name: 'build'
          }
        ]
      }]
    )
  })

  it('Should find two projects with two pipelines for the first and one for the second (and exclude projects without pipelines)', async() => {
    const config = {gitlabs: [{...gitlab}]}
    const projects = await update(config)
    expect(projects).to.deep.equal(
      [
        {
          archived: false,
          default_branch: 'master',
          group: 'gitlab-radiator-test',
          id: 5385889,
          maxNonFailedJobsVisible: 10,
          name: 'gitlab-radiator-test/ci-skip-test-project',
          nameWithoutNamespace: 'ci-skip-test-project',
          tags: [],
          url: 'https://gitlab.com/gitlab-radiator-test/ci-skip-test-project',
          pipelines: [
            {
              id: 234495591,
              status: 'success',
              commit: {
                author: 'Heikki Pora',
                title: '[ci skip] do nothing'
              },
              ref: 'master',
              stages: [{
                jobs: [{
                  finishedAt: '2020-12-25T20:08:30.992Z',
                  id: 932219322,
                  name: 'test',
                  startedAt: '2020-12-25T20:07:50.812Z',
                  status: 'success',
                  url: 'https://gitlab.com/gitlab-radiator-test/ci-skip-test-project/-/jobs/932219322'
                }],
                name: 'test'
              }]
            }
          ],
          status: 'success'
      },
      {
        archived: false,
        default_branch: 'master',
        group: 'gitlab-radiator-test',
        id: 5290928,
        maxNonFailedJobsVisible: 10,
        name: 'gitlab-radiator-test/integration-test-project-2',
        nameWithoutNamespace: 'integration-test-project-2',
        url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2',
        tags: [],
        pipelines: [
          {
            id: 234613306,
            status: 'success',
            commit: {
              title: 'Fail more',
              author: 'Heikki Pora'
            },
            ref: 'feature/test-branch',
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 932599898,
                    status: 'success',
                    name: 'fail_randomly_long_name',
                    startedAt: '2020-12-26T13:59:35.397Z',
                    finishedAt: '2020-12-26T14:00:11.845Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932599898'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 932599715,
                    status: 'success',
                    name: 'build_my_stuff',
                    startedAt: '2020-12-26T14:00:12.710Z',
                    finishedAt: '2020-12-26T14:00:53.946Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932599715'
                  }
                ]
              }
            ]
          },
          {
            id: 234613296,
            ref: 'master',
            status: 'failed',
            commit: {
              title: 'Fail more',
              author: 'Heikki Pora'
            },
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 932600811,
                    status: 'failed',
                    name: 'fail_randomly_long_name',
                    startedAt: '2020-12-26T14:00:39.928Z',
                    finishedAt: '2020-12-26T14:01:11.815Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932600811'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 932599688,
                    status: 'success',
                    name: 'build_my_stuff',
                    startedAt: '2020-12-26T13:58:54.325Z',
                    finishedAt: '2020-12-26T13:59:28.050Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-2/-/jobs/932599688'
                  }
                ]
              }
            ]
          }
        ],
        status: 'failed'
      },
      {
        archived: false,
        default_branch: 'master',
        group: 'gitlab-radiator-test',
        id: 5290865,
        maxNonFailedJobsVisible: 10,
        name: 'gitlab-radiator-test/integration-test-project-1',
        nameWithoutNamespace: 'integration-test-project-1',
        url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1',
        tags: ['display-1'],
        pipelines: [
          {
            id: 234493901,
            ref: 'master',
            status: 'success',
            commit: {
              title: 'Fail manual step',
              author: 'Heikki Pora'
            },
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 932213321,
                    status: 'success',
                    name: 'api-test',
                    startedAt: '2020-12-25T20:02:42.733Z',
                    finishedAt: '2020-12-25T20:03:36.383Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213321'
                  },
                  {
                    id: 932213322,
                    status: 'success',
                    name: 'browser-test',
                    startedAt: '2020-12-25T20:02:43.020Z',
                    finishedAt: '2020-12-25T20:03:28.386Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213322'
                  },
                  {
                    id: 932213319,
                    status: 'success',
                    name: 'eslint',
                    startedAt: '2020-12-25T20:02:42.444Z',
                    finishedAt: '2020-12-25T20:03:34.931Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213319'
                  },
                  {
                    id: 932213320,
                    status: 'success',
                    name: 'verify',
                    startedAt: '2020-12-25T20:02:42.663Z',
                    finishedAt: '2020-12-25T20:03:35.364Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213320'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 932213323,
                    status: 'success',
                    name: 'package-my-stuff',
                    startedAt: '2020-12-25T20:03:37.107Z',
                    finishedAt: '2020-12-25T20:04:22.618Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213323'
                  }
                ]
              },
              {
                name: 'deploy',
                jobs: [
                  {
                    id: 932213324,
                    status: 'success',
                    name: 'deploy-my-awesome-stuff',
                    startedAt: '2020-12-25T20:04:23.450Z',
                    finishedAt: '2020-12-25T20:05:14.167Z',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213324'
                  }
                ]
              },
              {
                name: 'finnish',
                jobs: [
                  {
                    id: 932213325,
                    status: 'manual',
                    name: 'manual_step-1',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213325'
                  },
                  {
                    id: 932213326,
                    status: 'manual',
                    name: 'manual_step-2',
                    url: 'https://gitlab.com/gitlab-radiator-test/integration-test-project-1/-/jobs/932213326'
                  }
                ]
              }
            ]
          }
        ],
        status: 'success'
      }]
    )
  })
})
