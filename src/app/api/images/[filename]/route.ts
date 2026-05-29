import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> | { filename: string } }
) {
  const resolvedParams = await params;
  const filename = resolvedParams.filename;

  const WORKSPACE_ID = process.env.FABRIC_WORKSPACE_ID || "";
  const LAKEHOUSE_ID = process.env.FABRIC_LAKEHOUSE_ID || "";
  const ONELAKE_URL = process.env.FABRIC_ONELAKE_URL || "https://onelake.blob.fabric.microsoft.com";

  const TENANT_ID = process.env.FABRIC_TENANT_ID || "";
  const CLIENT_ID = process.env.FABRIC_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.FABRIC_CLIENT_SECRET || "";

  if (!WORKSPACE_ID || !LAKEHOUSE_ID || !TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("[!] Microsoft Fabric credentials are not configured in environment variables.");
    return new NextResponse("Server configuration error: missing Fabric credentials", { status: 500 });
  }

  try {
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    
    const blobServiceClient = new BlobServiceClient(ONELAKE_URL, credential);
    const containerClient = blobServiceClient.getContainerClient(WORKSPACE_ID);
    
    // Thử tìm ảnh trực tiếp ở Files/bronze/ trước, nếu không có thì tìm ở Files/bronze/images/
    let targetPath = `${LAKEHOUSE_ID}/Files/bronze/${filename}`;
    let blobClient = containerClient.getBlobClient(targetPath);
    
    const exists = await blobClient.exists();
    if (!exists) {
      targetPath = `${LAKEHOUSE_ID}/Files/bronze/images/${filename}`;
      blobClient = containerClient.getBlobClient(targetPath);
    }
    
    const downloadResponse = await blobClient.download();
    const blobBody = await downloadResponse.blobBody;
    
    if (!blobBody) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(blobBody, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[!] Error proxying image from Fabric OneLake:", error);
    return new NextResponse(`Error proxying image: ${errorMessage}`, { status: 500 });
  }
}
