import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';


// Function to convert HTML content to screenshot
export default async function ConvertToImage(
    htmlContent: string,
    width: number,
    scaleFactor: number,
    textColor: string,
    backgroundColor: string,
    padding: number,
    fontSize: number,
): Promise<Buffer> {
    // Initialize Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

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
        const dom = new JSDOM(htmlContent);
        const readerable = new Readability(dom.window.document).parse();

        // Set viewport and content for the page
        await page.setViewport({
            width: width,
            height: Math.floor(width * (16 / 9)),
            deviceScaleFactor: Math.floor(Math.max(scaleFactor, 1)),
            isMobile: true,
            hasTouch: true
        });
        await page.setContent(readerable.content, { waitUntil: 'domcontentloaded' });

        // Add custom CSS to the page
        await page.addStyleTag({ content: customCSS });

        // Ensure all fonts are loaded
        await page.evaluateHandle('document.fonts.ready');

        // Take a full page screenshot
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png',
        });

        // Close the browser
        await browser.close();

        return screenshot;
    } catch (error) {
        await browser.close();
        throw error;
    }
}
