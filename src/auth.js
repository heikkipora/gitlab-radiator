import authenticate from 'basic-auth'

export function basicAuth(auth) {
  if (!auth || !auth.username || !auth.password) {
     
    console.log('No authentication configured')
    return (req, res, next) => next()
  }

   
  console.log('HTTP basic auth enabled')
  return (req, res, next) => {
    const {name, pass} = authenticate(req) || {}
    if (auth.username === name && auth.password === pass) {
      next()
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="gitlab-radiator"')
      res.status(401).end()
    }
  }
}
