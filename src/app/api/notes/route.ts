import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all notes for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isArchived = searchParams.get('archived') === 'true'
    const isDeleted = searchParams.get('deleted') === 'true'

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        isArchived,
        isDeleted,
      },
      include: {
        tags: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

// POST create a new note
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, color, isPinned, isArchived, reminder, images, tagIds } = body

    const note = await prisma.note.create({
      data: {
        title: title || "",
        content: content || "",
        color: color || "#ffffff",
        isPinned: isPinned || false,
        isArchived: isArchived || false,
        reminder: reminder ? new Date(reminder) : null,
        images: images || [],
        userId: session.user.id,
        tags: tagIds?.length > 0 ? {
          connect: tagIds.map((id: string) => ({ id }))
        } : undefined,
      },
      include: {
        tags: true,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}
