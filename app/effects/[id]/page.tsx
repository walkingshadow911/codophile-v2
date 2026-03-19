import React from "react";
import ClientEditor from "./ClientEditor";
import { Metadata } from "next";
import connectToDatabase from "@/lib/db";
import EffectModel from "@/lib/models/Effect";

type Props = {
    params: Promise<{ id: string }>
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    
    await connectToDatabase();
    const effect = await EffectModel.findOne({ id: params.id }).lean() as any;

    if (!effect || !effect.isPublished) {
        return {
            title: "Effect Not Found | Codophile",
            description: "The requested CSS effect could not be found or is not published."
        };
    }

    return {
        title: `${effect.title} | Codophile`,
        description: effect.description,
        keywords: effect.keywords,
        openGraph: {
            title: effect.title,
            description: effect.description,
            type: 'article',
            siteName: 'Codophile',
        },
        twitter: {
            card: 'summary_large_image',
            title: effect.title,
            description: effect.description,
        }
    };
}

export default async function EffectPage(props: Props) {
    const params = await props.params;
    
    await connectToDatabase();
    const effect = await EffectModel.findOne({ id: params.id }).lean();

    if (!effect || !(effect as any).isPublished) {
         return (
             <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
                 <div className="text-center">
                     <h1 className="text-2xl font-bold mb-4">Effect Not Found</h1>
                     <a href="/effects" className="text-pink-400 hover:underline">Back to Effects</a>
                 </div>
             </div>
         );
    }

    const plainEffect = JSON.parse(JSON.stringify(effect));

    return <ClientEditor initialEffect={plainEffect} />;
}
