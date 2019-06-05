interface request {
  err?: Error,
  originalContent: string,
  originalUrl: string,
  params?: object
}

class Router {
  private routes: {
    type: string,
    url: string | null,
    middlewares: (Router | Function)[]
  }[];

  private settings: {
    prefix?: string,
    'json spaces'?: string | number,
    'case sensitive routing'?: boolean,
    [key: string]: any
  };

  constructor() {
    this.routes = [];
    this.settings = {
      prefix: '',
      'json spaces': 2,
      'case sensitive routing': false
    };
  }

  contentMatches(content: string, route: string): boolean {
    if (this.get('case sensitive routing')) {
      return content.startsWith((this.get('prefix') + route).trim())
    }
    return content.toLowerCase().startsWith((this.get('prefix') + route).trim().toLowerCase())
  }

  set(option: 'prefix', value: string): Router
  set(option: 'case sensitive routing', value: boolean): Router
  set(option: 'json spaces', value: string | number): Router
  set(option: string, value: any): Router {
    this.settings[option] = value;
    return this;
  }

  get(option: 'prefix'): string
  get(option: 'case sensitive routing'): boolean
  get(option: 'json spaces'): string | number
  get(option: string) {
    return this.settings[option]
  }

  error(firstMiddleware: Router | Function, ...middleware: (Router | Function)[]): Router;
  error(url: string, ...middleware: (Router | Function)[]): Router;
  error(x: any, ...y: (Router | Function)[]): Router {
    return this.createRoute('error', x, ...y);
  }

  command(firstMiddleware: Router | Function, ...middleware: (Router | Function)[]): Router;
  command(url: string, ...middleware: (Router | Function)[]): Router;
  command(x: any, ...y: (Router | Function)[]): Router {
    return this.createRoute('command', x, ...y);
  }

  createRoute(routeType: string, firstMiddleware: Router | Function, ...middleware: (Router | Function)[]): Router;
  createRoute(routeType: string, url: string, ...middleware: (Router | Function)[]): Router;
  createRoute(routeType: string, x: any, ...y: (Router | Function)[]): Router {
    const middlewares: (Router | Function)[] = [];
    let url = null;
    
    if (typeof x === 'function') {
      middlewares.push(x);
    } else if (x instanceof Router) {
      middlewares.push(x);
    } else if (typeof x === 'string') {
      url = x;
    }

    middlewares.push(...y);

    this.routes.push({
      type: routeType,
      url,
      middlewares: middlewares
        .map((middleware) => {
          if (middleware instanceof Router) {
            middleware.set('prefix', ' ')
          }

          return middleware
        })
    });
    return this;
  }

  route(content: string, message: any, existingReq?: request, routeNumber?: number, middlewareNumber?: number): Promise<void> {
    return new Promise((resolve) => {
      let req: request;
      let i = 0;
      let j = 0;

      if (existingReq) {
        req = existingReq;
      } else {
        req = {
          originalContent: content,
          originalUrl: content,
        }
      }

      if (routeNumber) {
        i = routeNumber;
      }

      if (middlewareNumber) {
        j = middlewareNumber;
      }

      const route = this.routes[i];

      // If a route was not found, we've ran out of routes.
      if (!route) resolve();

      // If this route is not an error handler, go to the next route
      if (req.err && route.type !== 'error') {
        resolve(this.route(content, message, req, i + 1, 0));
        return;
      }
      
      // If this route is an error handler, but there's no error, go to the next route
      if (!req.err && route.type === 'error') {
        resolve(this.route(content, message, req, i + 1, 0));
        return;
      }

      // If the route URL is matched, try to execute the middleware
      if (route.url === null || this.contentMatches(content, route.url)) {
        const middleware = route.middlewares[j];
        const newContent = content.trim().substring(this.get('prefix').length + (typeof route.url === 'string' ? route.url.length : 0)).trim();

        if (typeof middleware === 'function') {
          middleware({
            message,
            err: req.err,
            content: newContent,
            next: (err?: Error): void => {
              if (err) {
                req.err = err;

                // If this is an error router, go to deeper middleware
                if (route.type === 'error') {
                  resolve(this.route(content, message, req, i, j + 1))
                } else {
                  // Otherwise, go to the next route in search for an error router.
                  resolve(this.route(content, message, req, i + 1, 0))
                }
              } else {
                // If this is an error router, skip this route
                if (route.type === 'error') {
                  resolve(this.route(content, message, req, i + 1, 0))
                } else {
                  // Otherwise, go to deeper middleware
                  resolve(this.route(content, message, req, i, j + 1))
                }
              }
            }
          })
        } else if (middleware instanceof Router) {
          // Do the middleware.
          middleware.route(newContent, message, req)
            .then(() => {
              // After routing, go to the next middleware
              resolve(this.route(content, message, req, i, j + 1))
            })
        } else {
          // There is no more middleware. Go to the next router.
          resolve(this.route(content, message, req, i + 1, 0))
        }
      } else {
        // The route didn't match. Go to the next router.
        resolve(this.route(content, message, req, i + 1, 0))
      }
    });
  }
}

export default Router;
