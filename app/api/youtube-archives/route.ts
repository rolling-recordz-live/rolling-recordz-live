import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json(
      { error: "Missing YouTube API settings", videos: [] },
      { status: 500 }
    );
  }

  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      { cache: "no-store" }
    );

    const channelJson = await channelRes.json();
    const uploadsPlaylist =
      channelJson?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylist) {
      return NextResponse.json({ videos: [] });
    }

    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylist}&maxResults=24&key=${apiKey}`,
      { cache: "no-store" }
    );

    const videosJson = await videosRes.json();

    const videos =
      videosJson?.items?.map((item: any) => ({
        id: item.contentDetails?.videoId,
        title: item.snippet?.title,
        description: item.snippet?.description,
        thumbnail:
          item.snippet?.thumbnails?.maxres?.url ||
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url,
        publishedAt: item.contentDetails?.videoPublishedAt,
      })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: "YouTube archive failed", videos: [] },
      { status: 500 }
    );
  }
}
