import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  app.get( "/filteredImage", async (req: express.Request, res: express.Response) => {

      const url = require('url');

      const query = url.parse(req.url, true).query;

      let { image_url } = query;

      if (!image_url) {
        return res.status(400)
          .send(`image_url is required`);
      }

      var path = require('path');
      if (path.extname(image_url) != '.jpg') {
        return res.status(400)
          .send(`image file must be .jpg format`);
      }

      const filteredPath = await filterImageFromURL(image_url);
      if (filteredPath) {

        res.status(200)
          .sendFile(filteredPath);

        res.on('finish', function () {
          const filesArray = [];
          filesArray.push(filteredPath);
          deleteLocalFiles(filesArray);
        });

        return;
      }


      return res.status(422)
        .send(`there was an issue with loading the image`);
    } );

  app.get("/deleteImages", async( req:express.Request, res:express.Response) => {
    
    const fs = require('fs');   
    const dir = __dirname + '/util/tmp';
    const filesArray = fs.readdirSync(dir);
    const absFilesArray = filesArray.map((file: any)=> {
      return dir +'/' + file;
    });

    await deleteLocalFiles(absFilesArray);

    return res.status(200).send('Images have been removed');
  
  } );
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();