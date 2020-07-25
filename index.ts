
interface HaSeulLocals {
  [key: string]: any;
  [key: number]: any;
}

interface HaSeulRequest {
  err?: Error,
  originalContent: string,
  originalUrl: string,
  params?: object,
  locals: HaSeulLocals,
}

interface HaSeulSearchResults {
  prefix: string,
  route: string | null,
  content: string,
}

type HaSeulCallbackFunction<Message> = ({
  message,
  userInput,
  route,
  err,
  content,
  prefix,
  done,
  next,
  req
}: {
  userInput: string,
  route: string | null,
  message?: Message,
  err: Error | undefined,
  content: string,
  prefix: string,
  done: (err?: Error) => void,
  next: (err?: Error) => void,
  req: HaSeulRequest,
}) => void

class HaSeul<Message = any> {
  private routes: {
    type: string,
    url: string | null,
    middlewares: (HaSeul<Message> | HaSeulCallbackFunction<Message>)[]
  }[];

  private settings: {
    prefix?: string[],
    'json spaces'?: string | number,
    'case sensitive routing'?: boolean,
    [key: string]: any
  };

  constructor() {
    this.routes = [];
    this.settings = {
      prefix: [],
      'json spaces': 2,
      'case sensitive routing': false
    };
  }

  /**
   * Returns the content of a message, if the prefix (and optional route) matches the user's message.
   * @param content The message content that the user has provided
   * @param route The route name that needs to be removed from the resulting content
   */
  getContentIfMatched(content: string, route: string | null): HaSeulSearchResults | null {
    const contentToCheck = this.get('case sensitive routing') ? content.trim() : content.toLowerCase().trim();
    const prefixes = this.get('prefix');

    let foundPrefix = '';
    let contentWithoutPrefix = content.trim();
    let contentWithoutPrefixToCheck = contentToCheck.trim();

    if (prefixes.length > 0 && prefixes.every(prefix => prefix !== '')) {
      let found = false;
      for (const prefix of this.get('prefix')) {
        const prefixToCheck = this.get('case sensitive routing') ? prefix : prefix.toLowerCase();

        // If the content doesn't start with the prefix, ignore.
        if (contentToCheck.startsWith(prefixToCheck)) {
          found = true;
          foundPrefix = prefix;
          contentWithoutPrefix = content.trim().substring(prefixToCheck.length).trim();
          contentWithoutPrefixToCheck = contentToCheck.substring(prefixToCheck.length).trim();

          break;
        }
      }

      if (!found) return null;
    }

    // If a route isn't specified, just send the content
    if (route === null) return {
      prefix: foundPrefix,
      route: null,
      content: contentWithoutPrefix,
    };

    // If the content doesn't start with the route, ignore.
    const routeToCheck = this.get('case sensitive routing') ? route.trim() : route.toLowerCase().trim();
    if (!contentWithoutPrefixToCheck.startsWith(routeToCheck)) return null;

    return {
      prefix: foundPrefix,
      route: route,
      content: contentWithoutPrefix.substring(routeToCheck.length).trim(),
    };
  }

  /**
   * Set the prefixes the router will respond to.
   * @param option `prefix`
   * @param value The prefix that the router should react to.
   */
  set(option: 'prefix', value: string[]): HaSeul<Message>

  /**
   * Set the prefix of the router.
   * @deprecated Please use an array of strings instead.
   * @param option `prefix`
   * @param value The prefixes that the router should react to.
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
    // TODO: Remove this line soon
    if (option === 'prefix' && typeof value === 'string') value = [value];
    this.settings[option] = value;
    return this;
  }

  /**
   * Obtain the current prefix of the router.
   * @param option `prefix`
   */
  get(option: 'prefix'): string[]

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
            middleware.set('prefix', [])
          }

          return middleware
        })
    });
    return this;
  }

  /**
   * Pass a message into the router
   * @param userInput The content of a message from a user
   * @param message The object from your client API
   */
  route(userInput: string, message?: Message): Promise<any> {
    return this.executeRouter({
      userInput,
      message
    })
  }

  /**
   * Pass a message into the router, and define a starting point for where the router should look at.
   * @param userInput The content of a message from a user
   * @param message The object from your client API that you would like to pass around to routers and middleware
   * @param existingReq The request object
   * @param routeNumber The route number - Refers to the route to look at in the routes array.
   * @param middlewareNumber The middleware number - Refers to the middleware array found in each route.
   * @private
   */
  private executeRouter({
    userInput,
    message,
    existingReq,
    routeNumber = 0,
    middlewareNumber = 0,
  }: {
    userInput: string,
    message?: Message,
    existingReq?: HaSeulRequest,
    routeNumber?: number,
    middlewareNumber?: number,
  }): Promise<void> {
    return new Promise((resolve) => {
      let req: HaSeulRequest;

      if (existingReq) {
        req = existingReq;
      } else {
        req = {
          originalContent: userInput,
          originalUrl: userInput,
          locals: {},
        }
      }

      const route = this.routes[routeNumber];

      // If a route was not found, we've ran out of routes.
      if (!route) resolve();

      const nextRoute = () => {
        resolve(this.executeRouter({
          userInput,
          message,
          existingReq: req,
          routeNumber: routeNumber + 1,
        }));
      }

      const nextMiddleware = () => {
        resolve(this.executeRouter({
          userInput,
          message,
          existingReq: req,
          routeNumber: routeNumber,
          middlewareNumber: middlewareNumber + 1,
        }));
      }

      // If this route is not an error handler, go to the next route
      if (req.err && route.type !== 'error') {
        nextRoute()
        return;
      }

      // If this route is an error handler, but there's no error, go to the next route
      if (!req.err && route.type === 'error') {
        nextRoute()
        return;
      }

      const match = this.getContentIfMatched(userInput, route.url)

      // If the route is matched, try to execute the middleware
      if (match) {
        const middleware = route.middlewares[middlewareNumber];

        if (typeof middleware === 'function') {
          try {
            middleware({
              userInput,
              message,
              req,
              err: req.err,
              route: route.url,
              content: match.content,
              prefix: match.prefix,
              done: (err?: Error): void => {
                if (err) {
                  req.err = err;

                  // If this is an error router, go to deeper middleware
                  if (route.type === 'error') {
                    nextMiddleware();
                  } else {
                    // Otherwise, go to the next route in search for an error router.
                    nextRoute();
                  }
                } else {
                  resolve()
                }
              },
              next: (err?: Error): void => {
                if (err) {
                  req.err = err;

                  // If this is an error router, go to deeper middleware
                  if (route.type === 'error') {
                    nextMiddleware();
                  } else {
                    // Otherwise, go to the next route in search for an error router.
                    nextRoute();
                  }
                } else {
                  // If this is an error router, skip this route
                  if (route.type === 'error') {
                    nextRoute();
                  } else {
                    // Otherwise, go to deeper middleware
                    nextMiddleware()
                  }
                }
              }
            })
          } catch (err) {
            req.err = err;

            // If this is an error router, go to deeper middleware
            if (route.type === 'error') {
              nextMiddleware();
            } else {
              // Otherwise, go to the next route in search for an error router.
              nextRoute();
            }
          }
        } else if (middleware instanceof HaSeul) {
          // Do the middleware.
          middleware.executeRouter({
            userInput: match.content,
            message,
            existingReq: req,
          })
            .then(() => {
              // After routing, go to the next middleware
              nextMiddleware();
            })
        } else {
          // There is no more middleware. Go to the next router.
          nextRoute();
        }
      } else {
        // The route didn't match. Go to the next router.
        nextRoute();
      }
    });
  }
}

export default HaSeul;
