import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/ErrorMiddleware";
import ConvertToImage from "./actions/ConvertToImage";
import validator from 'validator';


const app: Application = express();

dotenv.config();

app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: "*",
}));


// routes
// test ping route
app.get("/ping", (req: Request, res: Response) => {
  res.status(201).json({ message: "Pong!" });
});

// Route to handle the creation of a readable image
app.post('/readable-image', async (req: Request, res: Response, next: NextFunction) => {
  try {
      let { html, width, scale: scaleFactor, color: textColor, background: backgroundColor, padding, fsize: fontSize } = req.body;

      if ((isNaN(html)) && !html) {
          throw Error("HTML missing in request")
      }
      // Sanitize and validate width
      width = parseInt(width || 900); // Convert width to integer
      if (width < 600 || width > 1800 || isNaN(width)) {
          width = 900; // Default value if width is invalid
      }

      // Sanitize and validate scaleFactor
      scaleFactor = parseFloat(scaleFactor || 2); // Convert scaleFactor to float
      if (scaleFactor <= 1 || scaleFactor >= 5 || isNaN(scaleFactor)) {
          scaleFactor = 2; // Default value if scaleFactor is invalid
      }

      // Validate textColor and backgroundColor
      if (!validator.isHexColor(textColor || 'white')) {
          textColor = 'white'; // Default value if textColor is invalid
      }
      if (!validator.isHexColor(backgroundColor || 'black')) {
          backgroundColor = 'black'; // Default value if backgroundColor is invalid
      }

      // Sanitize and validate padding
      padding = parseInt(padding || 32); // Convert padding to integer
      if (padding < 0 || padding >= 64 || isNaN(padding)) {
          padding = 32; // Default value if padding is invalid
      }

        // Sanitize and validate fontSize
        fontSize = parseInt(fontSize || 12); // Convert fontSize to integer
        if (fontSize < 8 || fontSize >= 64 || isNaN(fontSize)) {
            fontSize = 12; // Default value if fontSize is invalid
        }

        
      // Now you have sanitized and validated variables

      // Convert HTML content to screenshot
      const screenshot: Buffer = await ConvertToImage(
          html,
          width,
          scaleFactor,
          textColor,
          backgroundColor,
          padding,
          fontSize
      );

      // Send the screenshot as the response
      res.set('Content-Type', 'image/png');
      res.send(screenshot);
  } catch (error) {
      next(error);
  }
});

// Middleware
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, (): void => console.info(`server is running on ${PORT}`));
