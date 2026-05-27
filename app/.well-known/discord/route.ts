import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse("dh=41f83fe5389cb932f40dda16ca0f47e9b9c789e6", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
