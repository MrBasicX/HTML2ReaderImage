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
const readability_1 = require("@mozilla/readability");
const jsdom_1 = require("jsdom");
const puppeteer_1 = __importDefault(require("puppeteer"));
const chromium_1 = __importDefault(require("@sparticuz/chromium"));
// Function to convert HTML content to screenshot
function ConvertToImage(htmlContent, width, scaleFactor, textColor, backgroundColor, padding, fontSize) {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize Puppeteer
        // const browser = await puppeteer.launch();
        chromium_1.default.setGraphicsMode = false;
        const browser = yield puppeteer_1.default.launch({
            args: chromium_1.default.args,
            defaultViewport: chromium_1.default.defaultViewport,
            executablePath: yield chromium_1.default.executablePath(),
        });
        const page = yield browser.newPage();
        try {
            // Define custom CSS for the page
            const customCSS = `
            @import url('https://fonts.googleapis.com/css2?family=Literata&display=swap');
            body {
                font-family: 'Literata', serif !important;
                color: ${textColor} !important;
                background-color: ${backgroundColor} !important;
                padding: ${padding}px !important;
                font-size: ${fontSize}px !important;
            }
        `;
            // Parse HTML content using Readability
            const dom = new jsdom_1.JSDOM(htmlContent);
            const readerable = new readability_1.Readability(dom.window.document).parse();
            // Set viewport and content for the page
            yield page.setViewport({
                width: width,
                height: Math.floor(width * (16 / 9)),
                deviceScaleFactor: Math.floor(Math.max(scaleFactor, 1)),
                isMobile: true,
                hasTouch: true
            });
            yield page.setContent(readerable.content, { waitUntil: 'domcontentloaded' });
            // Add custom CSS to the page
            yield page.addStyleTag({ content: customCSS });
            // Ensure all fonts are loaded
            yield page.evaluateHandle('document.fonts.ready');
            // Take a full page screenshot
            const screenshot = yield page.screenshot({
                fullPage: true,
                type: 'png',
            });
            // Close the browser
            yield browser.close();
            return screenshot;
        }
        catch (error) {
            yield browser.close();
            throw error;
        }
    });
}
exports.default = ConvertToImage;
//# sourceMappingURL=ConvertToImage.js.map