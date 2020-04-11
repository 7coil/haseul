interface HaSeulLocals {
  [key: string]: any;
  [key: number]: any;
}

interface request {
  err?: Error,
  originalContent: string,
  originalUrl: string,
  params?: object,
  locals: HaSeulLocals,
}

type HaSeulCallbackFunction<T> = ({
  message,
  err,
  content,
  next,
  req
}: {
  message: T,
  err: Error | undefined,
  content: string,
  next: (err?: Error) => void,
  req: request,
}) => void

class Router<T = any> {
  private routes: {
    type: string,
    url: string | null,
    middlewares: (Router<T> | HaSeulCallbackFunction<T>)[]
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

  getContentIfMatched(content: string, route: string | null): string | void {
    const contentToCheck = this.get('case sensitive routing') ? content.trim() : content.toLowerCase().trim();
    const prefixToCheck = this.get('case sensitive routing') ? this.get('prefix') : this.get('prefix').toLowerCase();

    // If the content doesn't start with the prefix, ignore.
    if (prefixToCheck.length && !contentToCheck.startsWith(prefixToCheck)) return;
    const contentWithoutPrefix = content.trim().substring(prefixToCheck.length).trim();
    const contentWithoutPrefixToCheck = contentToCheck.substring(prefixToCheck.length).trim();

    // If a route isn't specified, just send the content without the prefix.
    if (route === null) return contentWithoutPrefix;

    // If the content doesn't start with the route, ignore.
    const routeToCheck = this.get('case sensitive routing') ? route.trim() : route.toLowerCase().trim();
    if (!contentWithoutPrefixToCheck.startsWith(routeToCheck)) return;

    return contentWithoutPrefix.substring(routeToCheck.length).trim();
  }

  set(option: 'prefix', value: string): Router<T>
  set(option: 'case sensitive routing', value: boolean): Router<T>
  set(option: 'json spaces', value: string | number): Router<T>
  set(option: string, value: any): Router<T> {
    this.settings[option] = value;
    return this;
  }

  get(option: 'prefix'): string
  get(option: 'case sensitive routing'): boolean
  get(option: 'json spaces'): string | number
  get(option: string) {
    return this.settings[option]
  }

  error(firstMiddleware: Router<T> | HaSeulCallbackFunction<T>, ...middleware: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T>;
  error(url: string, ...middleware: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T>;
  error(x: any, ...y: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T> {
    return this.createRoute('error', x, ...y);
  }

  command(firstMiddleware: Router<T> | HaSeulCallbackFunction<T>, ...middleware: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T>;
  command(url: string, ...middleware: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T>;
  command(x: any, ...y: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T> {
    return this.createRoute('command', x, ...y);
  }

  createRoute(routeType: string, firstMiddleware: Router<T> | HaSeulCallbackFunction<T>, ...middleware: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T>;
  createRoute(routeType: string, url: string, ...middleware: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T>;
  createRoute(routeType: string, x: any, ...y: (Router<T> | HaSeulCallbackFunction<T>)[]): Router<T> {
    const middlewares: (Router<T> | HaSeulCallbackFunction<T>)[] = [];
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
            middleware.set('prefix', '')
          }

          return middleware
        })
    });
    return this;
  }

  route(userInput: string, message: T, existingReq?: request, routeNumber?: number, middlewareNumber?: number): Promise<void> {
    return new Promise((resolve) => {
      let req: request;
      let i = 0;
      let j = 0;

      if (existingReq) {
        req = existingReq;
      } else {
        req = {
          originalContent: userInput,
          originalUrl: userInput,
          locals: {},
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
        resolve(this.route(userInput, message, req, i + 1, 0));
        return;
      }
      
      // If this route is an error handler, but there's no error, go to the next route
      if (!req.err && route.type === 'error') {
        resolve(this.route(userInput, message, req, i + 1, 0));
        return;
      }

      const content = this.getContentIfMatched(userInput, route.url)

      // If the route URL is matched, try to execute the middleware
      if (typeof content === 'string') {
        const middleware = route.middlewares[j];
        
        if (typeof middleware === 'function') {
          middleware({
            message,
            req,
            err: req.err,
            content,
            next: (err?: Error): void => {
              if (err) {
                req.err = err;

                // If this is an error router, go to deeper middleware
                if (route.type === 'error') {
                  resolve(this.route(userInput, message, req, i, j + 1))
                } else {
                  // Otherwise, go to the next route in search for an error router.
                  resolve(this.route(userInput, message, req, i + 1, 0))
                }
              } else {
                // If this is an error router, skip this route
                if (route.type === 'error') {
                  resolve(this.route(userInput, message, req, i + 1, 0))
                } else {
                  // Otherwise, go to deeper middleware
                  resolve(this.route(userInput, message, req, i, j + 1))
                }
              }
            }
          })
        } else if (middleware instanceof Router) {
          // Do the middleware.
          middleware.route(content, message, req)
            .then(() => {
              // After routing, go to the next middleware
              resolve(this.route(userInput, message, req, i, j + 1))
            })
        } else {
          // There is no more middleware. Go to the next router.
          resolve(this.route(userInput, message, req, i + 1, 0))
        }
      } else {
        // The route didn't match. Go to the next router.
        resolve(this.route(userInput, message, req, i + 1, 0))
      }
    });
  }
}

export default Router;
