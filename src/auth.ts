import authenticate from 'basic-auth'
import type {NextFunction, Request, Response} from 'express'

type AuthConfig = { username?: string; password?: string } | undefined

export function basicAuth(auth: AuthConfig) {
  if (!auth || !auth.username || !auth.password) {
    console.log('No authentication configured')
    return (req: Request, res: Response, next: NextFunction) => next()
  }

  console.log('HTTP basic auth enabled')
  return (req: Request, res: Response, next: NextFunction) => {
    const {name, pass} = authenticate(req) || ({} as {name?: string; pass?: string})
    if (auth.username === name && auth.password === pass) {
      next()
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="gitlab-radiator"')
      res.status(401).end()
    }
  }
}
