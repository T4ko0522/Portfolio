import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse("dh=b634c251e47ee16f4299b3de9f4497ba7bbef130", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}