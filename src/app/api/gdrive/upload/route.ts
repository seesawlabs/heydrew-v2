import { NextRequest, NextResponse } from "next/server";

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("gdrive_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated with Google Drive" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  try {
    // 1. Create folder
    const folderRes = await fetch(DRIVE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "HeyDrew - Augusta Rule",
        mimeType: "application/vnd.google-apps.folder",
      }),
    });

    if (!folderRes.ok) {
      const err = await folderRes.text();
      console.error("Drive folder creation failed:", err);
      return NextResponse.json(
        { error: "Failed to create Drive folder" },
        { status: 502 }
      );
    }

    const { id: folderId } = await folderRes.json();

    // 2. Upload each file into the folder (parallel for speed)
    const uploadPromises = files.map(async (file) => {
      const metadata = JSON.stringify({
        name: file.name,
        parents: [folderId],
      });

      const body = new FormData();
      body.append(
        "metadata",
        new Blob([metadata], { type: "application/json" })
      );
      body.append("file", file);

      const res = await fetch(`${DRIVE_UPLOAD}?uploadType=multipart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Drive upload failed for ${file.name}:`, err);
      }
      return res.ok;
    });

    const results = await Promise.all(uploadPromises);
    const uploaded = results.filter(Boolean).length;

    // 3. Return folder link
    const response = NextResponse.json({
      folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
      uploaded,
      total: files.length,
    });
    response.cookies.delete("gdrive_token");
    return response;
  } catch (err) {
    console.error("Drive upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload to Google Drive" },
      { status: 500 }
    );
  }
}
