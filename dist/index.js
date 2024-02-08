"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const ErrorMiddleware_1 = require("./middlewares/ErrorMiddleware");
const ConvertToImage_1 = __importDefault(require("./actions/ConvertToImage"));
const colorMatch_1 = require("./utils/colorMatch");
const compression_1 = require("./utils/compression");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
// Enable CORS for all routes
app.use((0, cors_1.default)({
    origin: "*",
}));
// routes
// favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());
// ping route
app.get("/ping", (req, res) => {
    res.status(201).json({ message: "Pong!" });
});
// Root get
app.get("/", (req, res) => {
    res.status(200).send(`
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
`);
});
// Route to handle the creation of a readable image
app.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { html, width, scale: scaleFactor, color: textColor, background: backgroundColor, padding, font_size: fontSize, quality: imageQuality, } = req.body;
        if ((isNaN(html)) && !html) {
            throw Error("HTML missing in request");
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
        if (!(0, colorMatch_1.isValidColor)(textColor)) {
            textColor = process.env.DEFAULT_COLOR || ''; // load fefault value if textColor is invalid
        }
        if (!(0, colorMatch_1.isValidColor)(backgroundColor)) {
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
        const screenshot = yield (0, ConvertToImage_1.default)(html, width, scaleFactor, textColor, backgroundColor, padding, fontSize);
        const compressed = yield (0, compression_1.compressPngData)(screenshot, imageQuality);
        // Send the screenshot as the response
        res.set('Content-Type', 'image/webp');
        res.send(compressed);
    }
    catch (error) {
        next(error);
    }
}));
// Middleware
app.use(ErrorMiddleware_1.notFound);
app.use(ErrorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.info(`server is running on ${PORT}`));
//# sourceMappingURL=index.js.map