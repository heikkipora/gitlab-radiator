import fs from 'fs'
import os from 'os'
import yaml from 'js-yaml'
import {z} from 'zod'

function expandTilde(path: string) {
  return path.replace(/^~($|\/|\\)/, `${os.homedir()}$1`)
}

const JobStatusSchema = z.literal(['canceled', 'created', 'failed', 'manual', 'pending', 'running', 'skipped', 'success'])
export type JobStatus = z.infer<typeof JobStatusSchema>

const GitlabSchema = z.strictObject({
  url: z.string().min(1, 'Mandatory gitlab url missing from configuration file'),
  'access-token': z.string().min(1).optional(),
  ignoreArchived: z.boolean().default(true),
  maxNonFailedJobsVisible: z.coerce.number().int().default(999999),
  branch: z.string().min(1).optional(),
  caFile: z.string().optional(),
  offlineRunners: z.literal(['all', 'default', 'none']).default('default'),
  commitAsTitle: z.boolean().default(false),
  projects: z.strictObject({
    excludePipelineStatus: z.array(JobStatusSchema).optional(),
    include: z.string().min(1).optional(),
    exclude: z.string().min(1).optional()
  }).optional()
}).transform(gitlab => {
  const accessToken = gitlab['access-token'] || process.env.GITLAB_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('Mandatory gitlab access token missing from configuration (and none present at GITLAB_ACCESS_TOKEN env variable)')
  }

  const {url, ignoreArchived, maxNonFailedJobsVisible, caFile, branch, offlineRunners, commitAsTitle, projects} = gitlab
  const ca = caFile && fs.existsSync(caFile) ? fs.readFileSync(caFile, 'utf-8') : undefined

  return {
    url,
    ignoreArchived,
    maxNonFailedJobsVisible,
    branch,
    ca,
    offlineRunners,
    'access-token': accessToken,
    commitAsTitle,
    projects
  }
})

export type Gitlab = z.infer<typeof GitlabSchema>

const OrderSchema = z.literal(['status', 'name', 'id', 'nameWithoutNamespace', 'group'])

const ConfigSchema = z.strictObject({
  interval: z.coerce.number().default(10).transform(sec => sec * 1000),
  port: z.coerce.number().int().default(3000),
  zoom: z.coerce.number().default(1.0),
  columns: z.coerce.number().int().default(1),
  horizontal: z.boolean().default(false),
  rotateRunningPipelines: z.coerce.number().min(0).default(0).transform(sec => sec * 1000),
  groupSuccessfulProjects: z.boolean().default(false),
  projectsOrder: z.array(OrderSchema).default(['name']),
  gitlabs: z.array(GitlabSchema).min(1, {message: 'Mandatory gitlab properties missing from configuration file'}),
  colors: z.strictObject({
    background: z.string(),
    'created-background': z.string(),
    'created-text': z.string(),
    'dark-text': z.string(),
    'error-message-background': z.string(),
    'error-message-text': z.string(),
    'failed-background': z.string(),
    'failed-text': z.string(),
    'group-background': z.string(),
    'light-text': z.string(),
    'pending-background': z.string(),
    'pending-text': z.string(),
    'project-background': z.string(),
    'running-background': z.string(),
    'running-text': z.string(),
    'skipped-background': z.string(),
    'skipped-text': z.string(),
    'success-background': z.string(),
    'success-text': z.string()
  }).partial().optional(),
  auth: z.strictObject({
    username: z.string(),
    password: z.string()
  }).optional()
})

export type Config = z.infer<typeof ConfigSchema>

const configFile = expandTilde(process.env.GITLAB_RADIATOR_CONFIG || '~/.gitlab-radiator.yml')
const yamlContent = fs.readFileSync(configFile, 'utf8')
const rawConfig = yaml.load(yamlContent)
export const config = ConfigSchema.parse(rawConfig)
