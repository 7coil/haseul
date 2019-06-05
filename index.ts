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
    nestedRoutes?: Router,
    callback?: any
  }[];

  private settings: {
    prefix?: string,
    'json spaces'?: string,
    [key: string]: any
  };

  constructor() {
    this.routes = [];
    this.settings = {
      prefix: ''
    };
  }

  set(option: string, value: any) {
    this.settings[option] = value;
    return this;
  }

  get(option: string) {
    return this.settings[option]
  }

  error(nestedRoutes: Router): Router;
  error(callback: Function): Router;
  error(url: string, callback: Function): Router;
  error(url: string, nestedRoutes: Router): Router;
  error(x: any, y?: any): Router {
    return this.createRoute('error', x, y);
  }

  command(nestedRoutes: Router): Router;
  command(callback: Function): Router;
  command(url: string, callback: Function): Router;
  command(url: string, nestedRoutes: Router): Router;
  command(x: any, y?: any): Router {
    return this.createRoute('command', x, y);
  }

  createRoute(routeType: string, nestedRoutes: Router): Router;
  createRoute(routeType: string, callback: Function): Router;
  createRoute(routeType: string, url: string, callback: Function): Router;
  createRoute(routeType: string, url: string, nestedRoutes: Router): Router;
  createRoute(routeType: any, x: any, y?: any): Router {
    if (x instanceof Router) {
      x.settings = Object.assign({}, this.settings, {
        prefix: ' '
      });

      this.routes.push({
        type: routeType,
        nestedRoutes: x,
        url: null
      })
    } else if (typeof x === 'string' && y instanceof Router) {
      y.settings = Object.assign({}, this.settings, {
        prefix: ' '
      });

      this.routes.push({
        type: routeType,
        nestedRoutes: y,
        url: x,
      })
    } else if (typeof x === 'function') {
      this.routes.push({
        type: routeType,
        callback: x,
        url: null
      })
    } else if (typeof x === 'string' && typeof y === 'function') {
      this.routes.push({
        type: routeType,
        callback: y,
        url: x
      })
    }

    return this;
  }

  route(content: string, message: any, existingReq?: request, incrementor?: number): void {
    let req: request;
    let i = 0;

    if (existingReq) {
      req = existingReq;
    } else {
      req = {
        originalContent: content,
        originalUrl: content,
      }
    }

    if (incrementor) {
      i = incrementor;
    }

    const route = this.routes[i];
    i++;

    if (!route) return;
    if (req.err && route.type !== 'error') return this.route(content, message, req, i);
    if (!req.err && route.type === 'error') return this.route(content, message, req, i);
    if (content.startsWith(this.get('prefix') + route.url) || route.url === null) {
      if (route.callback) {
        route.callback({
          message,
          err: req.err,
          next: (err: Error) => {
            if (err) req.err = err;
            return this.route(content, message, req, i);
          }
        })
      }

      if (route.nestedRoutes) {
        const newContent = content.substring(this.get('prefix').length + (typeof route.url === 'string' ? route.url.length : 0));
        route.nestedRoutes.route(newContent, message, req);
      }

      return;
    }
    return this.route(content, message, req, i);
  }
}

export default Router;
