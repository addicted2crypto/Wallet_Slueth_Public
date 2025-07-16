import { NextResponse } from "next/server"
import { writeFileSync, readFileSync } from "fs"
import { join } from "path"

const CONFIG_FILE = join(process.cwd(), ".env.local")

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Read current .env.local file
    let envContent = ""
    try {
      envContent = readFileSync(CONFIG_FILE, "utf8")
    } catch (error) {
      // File doesn't exist, create new content
      envContent = ""
    }

    // Update or add SNOWSCAN_API_KEY
    const lines = envContent.split("\n")
    let keyUpdated = false

    const updatedLines = lines.map((line) => {
      if (line.startsWith("SNOWSCAN_API_KEY=")) {
        keyUpdated = true
        return `SNOWSCAN_API_KEY=${apiKey}`
      }
      return line
    })

    // If key wasn't found, add it
    if (!keyUpdated) {
      updatedLines.push(`SNOWSCAN_API_KEY=${apiKey}`)
    }

    // Write back to file
    writeFileSync(CONFIG_FILE, updatedLines.join("\n"))

    // Update process.env for immediate effect
    process.env.SNOWSCAN_API_KEY = apiKey

    return NextResponse.json({ success: true, message: "API key updated successfully" })
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 })
  }
}
