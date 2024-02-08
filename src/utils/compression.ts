import sharp from 'sharp';


export async function compressPngData(pngData: Buffer, quality: number): Promise<Buffer> {
    // Compress PNG data using sharp
    const compressedPngData = await sharp(pngData)
        .png(
            { 
                quality: quality,
            }
        )
        .toBuffer();

    return compressedPngData;
}