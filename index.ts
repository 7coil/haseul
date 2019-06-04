interface request {
  err?: Error,
  originalContent: string,
  originalUrl: string,
  params?: object
}

class Router {
  private routes: {
    type: string,
    url: string,
    nestedRoutes?: Router,
    callback?: any
  }[];

  private settings: object;

  constructor() {
    this.routes = [];
    this.settings = {
      prefix: ''
    };
  }

  set(option, value) {
    this.settings[option] = value;
    return this;
  }

  get(option) {
    return this.settings[option]
  }

  error(...props: [(Function | Router)] | [string, (Function | Router)]): Router {
    return this.createRoute('error', ...props);
  }

  command(...props: [(Function | Router)] | [string, (Function | Router)]): Router {
    return this.createRoute('command', ...props);
  }

  createRoute(routeType: string, ...props: [(Function | Router)] | [string, (Function | Router)]): Router {
    let url: string;
    let callback: Function;
    let nestedRoutes: Router;
  
    if (props[0] instanceof Router) {
      nestedRoutes = props[0];
    } else if (props[1] instanceof Router && typeof props[0] === 'string') {
      url = props[0];
      nestedRoutes = props[1];
    } else if (typeof props[0] === 'function') {
      callback = props[0];
    } else if (typeof props[0] === 'string' && typeof props[1] === 'function') {
      url = props[0];
      callback = props[1];
    }
    
    if (nestedRoutes) {
      nestedRoutes.settings = Object.assign({}, this.settings, {
        prefix: ''
      });
    }

    this.routes.push({
      type: routeType,
      nestedRoutes, url, callback
    })

    return this;
  }

  route(content: string, message: any, existingReq?: request, incrementor?: number) {
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
        return route.callback({
          message,
          err: req.err,
          next: (err) => {
            if (err) req.err = err;
            return this.route(content, message, req, i);
          }
        })
      }

      if (route.nestedRoutes) {
        const newContent = content.substring(this.get('prefix').length + route.url.length);
        return route.nestedRoutes.route(newContent, message, req);
      }
    }
    return this.route(content, message, req, i);
  }
}

export default Router;
