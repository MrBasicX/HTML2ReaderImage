import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/ErrorMiddleware";
import convertToImage from "./actions/ConvertToImage";
import validator from 'validator';


const app: Application = express();

dotenv.config();

app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: "*",
}));


// Middleware
app.use(notFound);
app.use(errorHandler);

// routes
// test ping route
app.get("/ping", (req: Request, res: Response) => {
  console.log("pinging")
  res.status(201).json({ message: "Pong!" });
});

// Route to handle the creation of a readable image
app.post('/readable-image', async (req: Request, res: Response) => {
  try {
      let { html, width, scaleFactor, textColor, backgroundColor, padding } = req.body;

      // Sanitize and validate width
      width = parseInt(width); // Convert width to integer
      if (width < 600 || width > 1800 || isNaN(width)) {
          width = 900; // Default value if width is invalid
      }

      // Sanitize and validate scaleFactor
      scaleFactor = parseFloat(scaleFactor); // Convert scaleFactor to float
      if (scaleFactor <= 1 || scaleFactor >= 5 || isNaN(scaleFactor)) {
          scaleFactor = 2; // Default value if scaleFactor is invalid
      }

      // Validate textColor and backgroundColor
      if (!validator.isHexColor(textColor)) {
          textColor = 'white'; // Default value if textColor is invalid
      }
      if (!validator.isHexColor(backgroundColor)) {
          backgroundColor = 'black'; // Default value if backgroundColor is invalid
      }

      // Sanitize and validate padding
      padding = parseInt(padding); // Convert padding to integer
      if (padding < 0 || padding >= 64 || isNaN(padding)) {
          padding = 32; // Default value if padding is invalid
      }

      // Now you have sanitized and validated variables

      // Convert HTML content to screenshot
      const screenshot: Buffer = await convertToImage(
          html,
          width,
          scaleFactor,
          textColor,
          backgroundColor,
          padding
      );

      // Send the screenshot as the response
      res.set('Content-Type', 'image/png');
      res.send(screenshot);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, (): void => console.log(`Server is running on ${PORT}`));
