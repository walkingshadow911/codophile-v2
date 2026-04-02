import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Effect from '@/lib/models/Effect';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

type RouteData = {
  url: string;
  priority: number;
  lastModified?: Date | string | null; 
};

export async function GET(request: Request) {
    if (process.env.NODE_ENV !== 'development') {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({error: 'not authorized'}, {status: 401});
        }
    }

    try {
        console.log('starting sitemap generation...');
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to database...');
            await mongoose.connect(process.env.MONGODB_URI as string);
        }
        console.log('Database Connection status:', mongoose.connection.readyState);

        const playgroundRoutes = [
          "css",
          "tailwind",
          "effects",
          "backgrounds",
          "borders",
          "filters",
          "flexbox",
          "typography",
          "transitions",
          "text-shadow",
          "box-shadow",
          "backdrop-filter",
        ];

        const staticRoutes: RouteData[] = [
          { url: 'https://codophile.in', priority: 1.0 },
          { url: 'https://codophile.in/about', priority: 0.8 },
          { url: 'https://codophile.in/effects', priority: 0.9 },
          { url: 'https://codophile.in/playground', priority: 0.9 },
          ...playgroundRoutes.map((route) => ({
            url: `https://codophile.in/playground/${route}`,
            priority: 0.8,
          })),
        ];
        
        const effectsData = await Effect.find();
        console.log(effectsData);
        
        const effectRoutes: RouteData[] = effectsData.map(effect => ({
            url: `https://codophile.in/effects/${effect.id}`,
            lastModified: effect.updatedAt,
            priority: 0.7
        }));
      
        const allRoutes = [...staticRoutes, ...effectRoutes];

        const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${allRoutes.map(route => `
              <url>
                <loc>${route.url}</loc>
                ${route.lastModified ? `<lastmod>${new Date(route.lastModified).toISOString()}</lastmod>` : ''}
                <priority>${route.priority}</priority>
              </url>
            `).join('')}
          </urlset>`;

        console.log('Uploading sitemap to AWS S3...');
        await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME as string,
                Key: "sitemap.xml",
                Body: sitemapXML,
                ContentType: "application/xml",
            })
        );
        console.log('Successfully uploaded sitemap to S3!');

        return new Response(sitemapXML, {
            status: 200, 
            headers: {
                'Content-Type': 'application/xml',
            },
        });

    } catch (error) {
        console.error("Sitemap generation failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}