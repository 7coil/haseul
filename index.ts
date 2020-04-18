
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

type HaSeulCallbackFunction<Message> = ({
  message,
  err,
  content,
  next,
  req
}: {
  message: Message,
  err: Error | undefined,
  content: string,
  next: (err?: Error) => void,
  req: request,
}) => void

class HaSeul<Message = any> {
  private routes: {
    type: string,
    url: string | null,
    middlewares: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]
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

  /**
   * Returns the content of a message, if the prefix (and optional route) matches the user's message.
   * @param content The message content that the user has provided
   * @param route The route name that needs to be removed from the resulting content
   */
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

  /**
   * Set the prefix of the router.
   * @param option `prefix`
   * @param value The prefix that the router should react to.
   */
  set(option: 'prefix', value: string): HaSeul<Message>

  /**
   * Set the case sensitivity of routing.
   * @param option `case sensitive routing`
   * @param value Whether or not the router should be case sensitive or not.
   */
  set(option: 'case sensitive routing', value: boolean): HaSeul<Message>

  /**
   * Set the white space that is used when converting an object to JSON.
   * @param option `json spaces`
   * @param value A number for the number of spaces to indent JSON objects by, or a string to use as the indenting character.
   * @beta
   */
  set(option: 'json spaces', value: string | number): HaSeul<Message>

  /**
   * Sets the value of `option` to `value`.
   * You can store anything, but some options can configure the properties of the router.
   * @param option The name of the option
   * @param value The value that will be assigned to this option
   */
  set(option: string, value: any): HaSeul<Message> {
    this.settings[option] = value;
    return this;
  }

  /**
   * Obtain the current prefix of the router.
   * @param option `prefix`
   */
  get(option: 'prefix'): string

  /**
   * Obtain whether or not the router is case sensitive or not.
   * @param option `case sensitive routing`
   */
  get(option: 'case sensitive routing'): boolean

  /**
   * Obtain the delimiter used to generate JSON objects.
   * @param option `json spaces`
   */
  get(option: 'json spaces'): string | number

  /**
   * Retrieve the value of a setting
   * @param option The name of the option
   */
  get(option: string) {
    return this.settings[option]
  }

  /**
   * Create an error handler which matches all commands
   * 
   * You can set up the handler by placing it at the bottom to catch all errors which are created by routers.
   * ```typescript
   * const router = new HaSeul<Message>();
   * 
   * router
   *  .command('help', ({ next }) => {
   *    next(new Error('An error occured while processing the HELP command!'))
   *  })
   *  .error(({ err, message }) => {
   *    console.log(err)
   *    message.channel.createMessage('An error occurred: ' + err)
   *  })
   * ```
   * 
   * @param middleware Middleware that will be executed in order whenever an error is caught by the router
   */
  error(...middleware: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message>;

  /**
   * Create an error handler which matches a command
   * @param url The command that must be matched in order for this route to be executed
   * @param middleware Middleware that will be executed in order whenever an error is caught by the router
   */
  error(url: string, ...middleware: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message>;
  error(x: any, ...y: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message> {
    return this.createRoute('error', x, ...y);
  }

  /**
   * Create a handler which matches all commands
   * @param middleware Middleware that will be executed in order whenever the route is executed
   */
  command(...middleware: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message>;

  /**
   * Create a handler which matches a command
   * @param url The command that must be matched in order for this route to be executed
   * @param middleware Middleware that will be executed in order whenever the route is executed
   */
  command(url: string, ...middleware: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message>;
  command(x: any, ...y: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message> {
    return this.createRoute('command', x, ...y);
  }

  /**
   * Create a handler which matches all commands
   * @param routeType The type of route to create.
   * @param middleware Middleware that will be executed in order whenever the route is executed
   * @private
   */
  createRoute(routeType: string, ...middleware: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message>;

  /**
   * Create a handler which matches a command
   * @param routeType The type of route to create.
   * @param url The command that must be matched in order for this route to be executed
   * @param middleware Middleware that will be executed in order whenever the route is executed
   * @private
   */
  createRoute(routeType: string, url: string, ...middleware: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message>;
  createRoute(routeType: string, x: any, ...y: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]): HaSeul<Message> {
    const middlewares: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[] = [];
    let url = null;
    
    if (typeof x === 'function') {
      middlewares.push(x);
    } else if (x instanceof HaSeul) {
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
          if (middleware instanceof HaSeul) {
            middleware.set('prefix', '')
          }

          return middleware
        })
    });
    return this;
  }

  /**
   * Pass a message into the router.
   * @param userInput The content of a message from a user
   * @param message The object from your client API that you would like to pass around to routers and middleware
   */
  route(userInput: string, message: Message): Promise<void>;

  /**
   * Pass a message into the router, and define a starting point for where the router should look at.
   * @param userInput The content of a message from a user
   * @param message The object from your client API that you would like to pass around to routers and middleware
   * @param existingReq The request object
   * @param routeNumber The route number - Refers to the route to look at in the routes array.
   * @param middlewareNumber The middleware number - Refers to the middleware array found in each route.
   */
  route(userInput: string, message: Message, existingReq?: request, routeNumber?: number, middlewareNumber?: number): Promise<void>;
  route(userInput: string, message: Message, existingReq?: request, routeNumber?: number, middlewareNumber?: number): Promise<void> {
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
          try {
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
          } catch(err) {
            req.err = err;

            // If this is an error router, go to deeper middleware
            if (route.type === 'error') {
              resolve(this.route(userInput, message, req, i, j + 1))
            } else {
              // Otherwise, go to the next route in search for an error router.
              resolve(this.route(userInput, message, req, i + 1, 0))
            }
          }
        } else if (middleware instanceof HaSeul) {
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

export default HaSeul;
