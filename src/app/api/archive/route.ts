import JSZip from "jszip";

interface ArchiveDownload {
  format: string;
  name: string;
  url: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urls = JSON.parse(searchParams.get("urls") || "");

  try {
    const downloads = await Promise.all(
      urls?.map(async ({ url, name, format }: ArchiveDownload) => {
        return {
          data: await fetch(url).then((r) => r.arrayBuffer()),
          name: `${name}.${format}`,
        };
      }),
    );

    const zip = new JSZip();

    downloads.forEach((download: { data: ArrayBuffer; name: string }) => {
      zip.file(download.name, download.data);
    });

    const archive: Blob = await new Promise((resolve) => {
      zip.generateAsync({ type: "blob" }).then(function (content) {
        resolve(content);
      });
    });

    return new Response(archive, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    let message = "Unknown Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
}
