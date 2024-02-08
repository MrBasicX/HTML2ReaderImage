import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/ErrorMiddleware";
import ConvertToImage from "./actions/ConvertToImage";
import { isValidColor } from "./utils/colorMatch";
import { compressPngData } from "./utils/compression";


const app: Application = express();

dotenv.config();

app.use(express.json());

// Enable CORS for all routes
app.use(cors({
    origin: "*",
}));


// routes
// favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());
// ping route
app.get("/ping", (req: Request, res: Response) => {
    res.status(201).json({ message: "Pong!" });
});

// Root get
app.get("/", (req: Request, res: Response) => {
    res.status(200).send(
`
<pre>
Ready for serving!
{
    html = The HTML body of the page to be rendered.
    width = Width of the image (viewport of browser used) [900px]
    scale = Scale of the image (browser used) [2x]
    color = Font color [${process.env.DEFAULT_COLOR}]
    background = Background color [${process.env.DEFAULT_BACKGROUND}]
    padding = Padding for the image [32px]
    font_size = Font size [18px]
    quality = Quality of the PNG image generated [${process.env.DEFAULT_IMAGE_QUALITY}]
}
</pre>
`
    );
});

// Route to handle the creation of a readable image
app.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {
            html,
            width,
            scale: scaleFactor,
            color: textColor,
            background: backgroundColor,
            padding,
            font_size: fontSize,
            quality: imageQuality,
        } = req.body;

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
        if (!isValidColor(textColor)) {
            textColor = process.env.DEFAULT_COLOR || ''; // load fefault value if textColor is invalid
        }

        if (!isValidColor(backgroundColor)) {
            backgroundColor = process.env.DEFAULT_BACKGROUND || ''; // load default value if backgroundColor is invalid
        }

        // Sanitize and validate padding
        padding = parseInt(padding || 32); // Convert padding to integer
        if (padding < 0 || padding >= 64 || isNaN(padding)) {
            padding = 32; // Default value if padding is invalid
        }

        // Sanitize and validate fontSize
        fontSize = parseInt(fontSize || 18); // Convert fontSize to integer
        if (fontSize < 8 || fontSize >= 64 || isNaN(fontSize)) {
            fontSize = 18; // Default value if fontSize is invalid
        }

        // Sanitize and validate imageQuality
        imageQuality = parseInt(imageQuality || process.env.DEFAULT_IMAGE_QUALITY); // Convert imageQuality to integer
        if (imageQuality < 5 || imageQuality > 100 || isNaN(imageQuality)) {
            imageQuality = 100; // Default value if imageQuality is invalid
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

        const compressed: Buffer = await compressPngData(screenshot, imageQuality);

        // Send the screenshot as the response
        res.set('Content-Type', 'image/webp');
        res.send(compressed);
    } catch (error) {
        next(error);
    }
});

// Middleware
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, (): void => console.info(`server is running on ${PORT}`));
