import { getAlgoliaClient, ALGOLIA_INDEX_NAME } from "@/lib/algolia/client";
import connectToDatabase from "@/lib/db";
import Effect from "@/lib/models/Effect";

export async function POST() {
  await connectToDatabase();
  const effects = await Effect.find({ isPublished: true }).lean();

  const records = effects.map((effect: any) => ({
    objectID: effect.id,
    title: effect.title,
    description: effect.description,
    keywords: effect.keywords,
    url: `/effects/${effect.id}`,
    type: "effect",
  }));

  await getAlgoliaClient().saveObjects({
    indexName: ALGOLIA_INDEX_NAME,
    objects: records,
  });

  return Response.json({
    success: true,
    count: records.length,
  });
}