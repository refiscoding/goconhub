import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ISSUE_TYPES = ["billing", "booking", "account", "verification", "other"];
const ROLES       = ["customer", "vendor", "other"];

export async function POST(req: NextRequest) {
  const { name, email, role, issueType, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim())
    return NextResponse.json({ message: "Name, email and message are required." }, { status: 400 });

  if (!ROLES.includes(role))
    return NextResponse.json({ message: "Invalid role." }, { status: 400 });

  if (!ISSUE_TYPES.includes(issueType))
    return NextResponse.json({ message: "Invalid issue type." }, { status: 400 });

  const ticket = await prisma.supportTicket.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), role, issueType, message: message.trim() },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
