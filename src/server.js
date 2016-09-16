import path from 'path';
import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import NotFoundPage from './components/NotFoundPage';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));

// universal routing and rendering
app.get('*', (req, res) => {
  match(
    { 
      routes, // used to pass the React Router routes configuration. Here, we are passing the exact same configuration that we used for the client-side rendering.
      location: req.url // This is used to specify the currently requested URL.

    },
    (err, redirectLocation, renderProps) => {

      // Case 1: in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // Case 2: in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // Case 3: if the current route matched we have renderProps
        /* renderProps is an object that contains the data we need to use to render the component */
        markup = renderToString(<RouterContext {...renderProps}/>); 
      } else {
        // Case 4: otherwise we can render a 404 page
        markup = renderToString(<NotFoundPage/>);
        res.status(404);
      }

      // render the index template with the embedded React markup
      return res.render('index', { markup });
    }
  );
});

// start the server
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});