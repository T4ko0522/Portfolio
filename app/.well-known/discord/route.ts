import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse("dh=382d116eeea41b1acbe96603b0c6c0c6a8500b83", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}